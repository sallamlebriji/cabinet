import { Router } from "express";
import { getPublicCabinet, getSettings, updateSettings } from "../controllers/settings.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";

export const settingsRoutes = Router();
settingsRoutes.get("/public", getPublicCabinet);
settingsRoutes.get("/", protect, scopeTenant, checkTenantActive, requireModule("settings"), getSettings);
settingsRoutes.put("/", protect, scopeTenant, checkTenantActive, requireModule("settings"), allowRoles("SUPER_ADMIN", "ADMIN_TENANT"), updateSettings);
