import { Router } from "express";
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from "../controllers/employee.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { registerValidator } from "../validators/auth.validators.js";
import { mongoIdParam } from "../validators/common.validators.js";

export const employeeRoutes = Router();
employeeRoutes.use(protect, scopeTenant, checkTenantActive, requireModule("users"), allowRoles("SUPER_ADMIN", "ADMIN_TENANT"));
employeeRoutes.get("/", listEmployees);
employeeRoutes.post("/", registerValidator, validate, createEmployee);
employeeRoutes.put("/:id", mongoIdParam, validate, updateEmployee);
employeeRoutes.delete("/:id", mongoIdParam, validate, deleteEmployee);
