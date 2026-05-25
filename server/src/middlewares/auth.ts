import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { modulePermissions } from "../config/modules.js";
import { env } from "../config/env.js";
import { Subscription } from "../models/Subscription.js";
import { Tenant } from "../models/Tenant.js";
import { User, type UserRole } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

type AccessPayload = { sub: string; userId?: string; role: UserRole; tenantId?: string };

export async function protect(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentification requise"));

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      return next(new ApiError(StatusCodes.UNAUTHORIZED, "Utilisateur invalide"));
    }

    req.user = user;
    req.tenantId = user.role === "SUPER_ADMIN" ? payload.tenantId : user.tenant ? String(user.tenant) : undefined;
    next();
  } catch {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Token invalide ou expire"));
  }
}

export function allowRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, "Acces refuse"));
    }
    next();
  };
}

export const authorize = allowRoles;

export function scopeTenant(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new ApiError(StatusCodes.UNAUTHORIZED, "Authentification requise"));

  if (req.user.role === "SUPER_ADMIN") {
    const tenantId = req.query.tenantId ?? req.query.tenant ?? req.body.tenantId ?? req.body.tenant;
    if (typeof tenantId === "string" && mongoose.isValidObjectId(tenantId)) req.tenantId = tenantId;
    return next();
  }

  if (!req.user.tenant) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Aucun tenant associe a cet utilisateur"));
  }

  req.tenantId = String(req.user.tenant);
  req.query.tenantId = req.tenantId;
  req.body.tenantId = req.tenantId;
  req.body.tenant = req.tenantId;
  next();
}

export async function checkTenantActive(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role === "SUPER_ADMIN") return next();
  if (!req.tenantId) return next(new ApiError(StatusCodes.FORBIDDEN, "Tenant manquant"));

  const [tenant, subscription] = await Promise.all([Tenant.findById(req.tenantId), Subscription.findOne({ tenant: req.tenantId })]);
  if (!tenant || !tenant.isActive) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Tenant suspendu ou introuvable"));
  }
  if (!subscription || subscription.status === "canceled" || (subscription.endDate && subscription.endDate < new Date())) {
    return next(new ApiError(StatusCodes.FORBIDDEN, "Abonnement inactif ou expire"));
  }

  req.tenant = tenant;
  req.subscription = subscription;
  next();
}

export function requireModule(moduleName: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !modulePermissions[moduleName]?.includes(role)) {
      return next(new ApiError(StatusCodes.FORBIDDEN, "Module non autorise pour ce role"));
    }

    if (role === "SUPER_ADMIN") return next();

    const modules = req.tenant?.modules as Map<string, boolean> | Record<string, boolean> | undefined;
    const enabled = modules instanceof Map ? modules.get(moduleName) : modules?.[moduleName];
    const subscriptionAllowsModule = req.subscription?.enabledModules.includes(moduleName) ?? false;
    if (enabled === false || !subscriptionAllowsModule) {
      return next(new ApiError(StatusCodes.FORBIDDEN, "Module desactive pour ce tenant"));
    }

    next();
  };
}
