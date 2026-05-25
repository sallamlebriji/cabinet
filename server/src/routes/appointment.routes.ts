import { Router } from "express";
import { createAppointment, deleteAppointment, listAppointments, updateAppointment, updateAppointmentStatus } from "../controllers/appointment.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { appointmentValidator, mongoIdParam } from "../validators/common.validators.js";

export const appointmentRoutes = Router();
appointmentRoutes.use(protect);
appointmentRoutes.use(scopeTenant, checkTenantActive, requireModule("appointments"));
appointmentRoutes.get("/", listAppointments);
appointmentRoutes.post("/", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"), appointmentValidator, validate, createAppointment);
appointmentRoutes.put("/:id", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"), mongoIdParam, appointmentValidator, validate, updateAppointment);
appointmentRoutes.patch("/:id/status", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"), mongoIdParam, validate, updateAppointmentStatus);
appointmentRoutes.delete("/:id", allowRoles("SUPER_ADMIN", "ADMIN_TENANT"), mongoIdParam, validate, deleteAppointment);
