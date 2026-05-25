import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller.js";
import { checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";

export const dashboardRoutes = Router();
dashboardRoutes.get("/stats", protect, scopeTenant, checkTenantActive, requireModule("dashboard"), getStats);
