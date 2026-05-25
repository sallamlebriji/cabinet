import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env.js";
import { planLimits } from "../config/modules.js";
import { Setting } from "../models/Setting.js";
import { Subscription } from "../models/Subscription.js";
import { Tenant } from "../models/Tenant.js";
import { User, type IUser } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken } from "../utils/tokens.js";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "tenant";
  let slug = base;
  let index = 2;
  while (await Tenant.exists({ slug })) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

function setRefreshCookie(res: import("express").Response, token: string) {
  res.cookie(env.refreshCookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function ensureTenantCanAuthenticate(user: IUser | null) {
  if (!user || !user.isActive) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Utilisateur invalide ou inactif");
  }

  if (user.role === "SUPER_ADMIN") return { tenant: null, subscription: null };
  if (!user.tenant) throw new ApiError(StatusCodes.FORBIDDEN, "Aucun tenant associe a cet utilisateur");

  const [tenant, subscription] = await Promise.all([Tenant.findById(user.tenant), Subscription.findOne({ tenant: user.tenant })]);
  if (!tenant || !tenant.isActive) throw new ApiError(StatusCodes.FORBIDDEN, "Tenant suspendu ou introuvable");
  if (!subscription || subscription.status === "canceled" || (subscription.endDate && subscription.endDate < new Date())) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Abonnement inactif ou expire");
  }

  return { tenant, subscription };
}

async function authPayload(user: IUser | null) {
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Utilisateur invalide");
  const { tenant, subscription } = await ensureTenantCanAuthenticate(user);
  return {
    accessToken: signAccessToken(user),
    user,
    tenant,
    subscription,
    modules: subscription?.enabledModules ?? []
  };
}

export const register = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new ApiError(StatusCodes.CONFLICT, "Cet email est déjà utilisé");

  const hasSuperAdmin = await User.exists({ role: "SUPER_ADMIN" });
  const role = req.body.role === "SUPER_ADMIN" && !hasSuperAdmin ? "SUPER_ADMIN" : "ADMIN_TENANT";
  const tenant =
    role === "ADMIN_TENANT"
      ? await Tenant.create({
          name: req.body.tenantName || req.body.cabinetName || `Cabinet de ${req.body.name}`,
          slug: await uniqueSlug(req.body.tenantName || req.body.cabinetName || req.body.name),
          email: req.body.email,
          plan: "FREE"
        })
      : undefined;

  if (tenant) {
    await Promise.all([
      Subscription.create({ tenant: tenant._id, plan: "FREE", status: "trial", ...planLimits.FREE }),
      Setting.create({
        tenant: tenant._id,
        cabinetName: tenant.name,
        slug: tenant.slug,
        email: tenant.email,
        preferences: { primaryColor: tenant.primaryColor }
      })
    ]);
  }

  const user = await User.create({ ...req.body, role, tenant: tenant?._id });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.tokenVersion);
  setRefreshCookie(res, refreshToken);

  const safeUser = await User.findById(user.id);
  const payload = await authPayload(safeUser);
  res.status(StatusCodes.CREATED).json({ success: true, ...payload, accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select("+password");
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Identifiants invalides");
  }
  await ensureTenantCanAuthenticate(user);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.tokenVersion);
  setRefreshCookie(res, refreshToken);

  const safeUser = await User.findById(user.id);
  const payload = await authPayload(safeUser);
  res.json({ success: true, ...payload, accessToken });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.refreshCookieName];
  if (!token) throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token manquant");

  const payload = jwt.verify(token, env.jwtRefreshSecret) as { sub: string; tokenVersion: number };
  const user = await User.findById(payload.sub);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Refresh token invalide");
  }

  const payloadResponse = await authPayload(user);
  res.json({ success: true, ...payloadResponse });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.tokenVersion += 1;
    await req.user.save();
  }
  res.clearCookie(env.refreshCookieName);
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user, tenant: req.tenant ?? null, subscription: req.subscription ?? null, modules: req.subscription?.enabledModules ?? [] });
});

export const forgotPassword = asyncHandler(async (_req, res) => {
  const resetToken = crypto.randomBytes(24).toString("hex");
  res.json({
    success: true,
    message: "Lien de réinitialisation préparé. Branchez votre service email en production.",
    resetToken
  });
});

export const resetPassword = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: "Mot de passe réinitialisé. Implémentez le stockage du token email." });
});
