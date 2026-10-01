import { StatusCodes } from "http-status-codes";
import { Setting } from "../models/Setting.js";
import { Tenant } from "../models/Tenant.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { CONFIGURABLE_MODULES, CONFIGURABLE_ROLES, roleModules, sanitizeRoleModules } from "../utils/permissions.js";
import { tenantFilter, tenantIdForWrite } from "../utils/tenant.js";

const WEEK_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function cleanOpeningHours(input: unknown) {
  if (!Array.isArray(input)) return undefined;
  return input.filter((row) => WEEK_DAYS.includes(String((row as Record<string, unknown>)?.day))).slice(0, 7).map((row) => {
    const item = (row ?? {}) as Record<string, unknown>;
    return {
      day: String(item.day ?? ""),
      open: TIME.test(String(item.open)) ? String(item.open) : "09:00",
      close: TIME.test(String(item.close)) ? String(item.close) : "18:00",
      closed: Boolean(item.closed)
    };
  });
}

export const getSettings = asyncHandler(async (req, res) => {
  const filter = req.user ? tenantFilter(req) : {};
  const settings = await Setting.findOne(filter).sort({ createdAt: 1 });
  res.json({ success: true, settings });
});

export const getPublicCabinet = asyncHandler(async (req, res) => {
  const slug = typeof req.query.slug === "string" ? req.query.slug : "cabinet-atlas";
  const tenant = await Tenant.findOne({ slug, isActive: true });
  const settings = tenant ? await Setting.findOne({ tenant: tenant._id }) : null;
  res.json({ success: true, settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const tenant = tenantIdForWrite(req);
  const update: Record<string, unknown> = { tenant };
  for (const field of ["cabinetName", "email", "phone", "address"] as const) {
    if (typeof req.body[field] === "string") update[field] = req.body[field].trim();
  }
  if (update.cabinetName === "") throw new ApiError(StatusCodes.BAD_REQUEST, "Le nom du cabinet est requis");
  const openingHours = cleanOpeningHours(req.body.openingHours);
  if (openingHours) update.openingHours = openingHours;

  const settings = await Setting.findOneAndUpdate({ tenant }, update, { upsert: true, new: true, runValidators: true });
  await Tenant.findByIdAndUpdate(tenant, { name: settings.cabinetName, email: settings.email, phone: settings.phone, address: settings.address });
  res.json({ success: true, settings });
});

export const getPermissions = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(tenantIdForWrite(req));
  if (!tenant) throw new ApiError(StatusCodes.NOT_FOUND, "Cabinet introuvable");
  res.json({
    success: true,
    modules: CONFIGURABLE_MODULES,
    roles: Object.fromEntries(CONFIGURABLE_ROLES.map((role) => [role, roleModules(tenant, role)]))
  });
});

export const updatePermissions = asyncHandler(async (req, res) => {
  const roles = sanitizeRoleModules(req.body.roles);
  const tenant = await Tenant.findByIdAndUpdate(tenantIdForWrite(req), { roleModules: roles }, { new: true });
  if (!tenant) throw new ApiError(StatusCodes.NOT_FOUND, "Cabinet introuvable");
  res.json({ success: true, modules: CONFIGURABLE_MODULES, roles });
});
