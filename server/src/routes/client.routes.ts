import { Router } from "express";
import { createClient, deleteClient, getClient, listClients, updateClient } from "../controllers/client.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { clientValidator, mongoIdParam } from "../validators/common.validators.js";

export const clientRoutes = Router();
clientRoutes.use(protect);
clientRoutes.use(scopeTenant, checkTenantActive, requireModule("customers"));
clientRoutes.get("/", listClients);
clientRoutes.post("/", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"), clientValidator, validate, createClient);
clientRoutes.get("/:id", mongoIdParam, validate, getClient);
clientRoutes.put("/:id", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"), mongoIdParam, clientValidator, validate, updateClient);
clientRoutes.delete("/:id", allowRoles("SUPER_ADMIN", "ADMIN_TENANT"), mongoIdParam, validate, deleteClient);
