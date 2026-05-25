import { Router } from "express";
import { appointmentRoutes } from "./appointment.routes.js";
import { authRoutes } from "./auth.routes.js";
import { clientRoutes } from "./client.routes.js";
import { dashboardRoutes } from "./dashboard.routes.js";
import { documentRoutes } from "./document.routes.js";
import { employeeRoutes } from "./employee.routes.js";
import { invoiceRoutes } from "./invoice.routes.js";
import { notificationRoutes } from "./notification.routes.js";
import { serviceRoutes } from "./service.routes.js";
import { settingsRoutes } from "./settings.routes.js";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/tenants", tenantRoutes);
routes.use("/cabinets", tenantRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/clients", clientRoutes);
routes.use("/appointments", appointmentRoutes);
routes.use("/services", serviceRoutes);
routes.use("/invoices", invoiceRoutes);
routes.use("/employees", employeeRoutes);
routes.use("/documents", documentRoutes);
routes.use("/notifications", notificationRoutes);
routes.use("/settings", settingsRoutes);
import { tenantRoutes } from "./tenant.routes.js";
