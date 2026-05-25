import { Router } from "express";
import { createService, deleteService, listServices, updateService } from "../controllers/service.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { mongoIdParam, serviceValidator } from "../validators/common.validators.js";

export const serviceRoutes = Router();
serviceRoutes.use(protect);
serviceRoutes.use(scopeTenant, checkTenantActive, requireModule("settings"));
serviceRoutes.get("/", listServices);
serviceRoutes.use(allowRoles("SUPER_ADMIN", "ADMIN_TENANT"));
serviceRoutes.post("/", serviceValidator, validate, createService);
serviceRoutes.put("/:id", mongoIdParam, serviceValidator, validate, updateService);
serviceRoutes.delete("/:id", mongoIdParam, validate, deleteService);
