import { Router } from "express";
import {
  deleteTenant,
  getTenant,
  getTenantStats,
  impersonateTenant,
  listTenants,
  provisionTenant,
  toggleTenant,
  updateTenant
} from "../controllers/tenant.controller.js";
import { allowRoles, protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { mongoIdParam } from "../validators/common.validators.js";

export const tenantRoutes = Router();

tenantRoutes.use(protect, allowRoles("SUPER_ADMIN"));
tenantRoutes.get("/", listTenants);
tenantRoutes.get("/:id", mongoIdParam, validate, getTenant);
tenantRoutes.post("/provision", provisionTenant);
tenantRoutes.put("/:id", mongoIdParam, validate, updateTenant);
tenantRoutes.patch("/:id/toggle", mongoIdParam, validate, toggleTenant);
tenantRoutes.delete("/:id", mongoIdParam, validate, deleteTenant);
tenantRoutes.get("/:id/stats", mongoIdParam, validate, getTenantStats);
tenantRoutes.post("/:id/impersonate", mongoIdParam, validate, impersonateTenant);
