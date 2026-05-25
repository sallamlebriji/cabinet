import { Router } from "express";
import { listNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import { checkTenantActive, protect, scopeTenant } from "../middlewares/auth.js";

export const notificationRoutes = Router();
notificationRoutes.use(protect, scopeTenant, checkTenantActive);
notificationRoutes.get("/", listNotifications);
notificationRoutes.patch("/:id/read", markNotificationRead);
