import { Router } from "express";
import rateLimit from "express-rate-limit";
import { body, param } from "express-validator";
import { portalCancelAppointment, portalInvoicePdf, portalLogin, portalMe, protectPortal } from "../controllers/portal.controller.js";
import { bookAppointment, getBookingCabinet, getBusySlots } from "../controllers/public.controller.js";
import { validate } from "../middlewares/validate.js";
import { mongoIdParam } from "../validators/common.validators.js";

const bookingLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const slugParam = [param("slug").isSlug()];
const phone = (field: string) => body(field).isString().trim().matches(/^[+\d][\d\s().-]{7,19}$/);

export const publicRoutes = Router();
publicRoutes.get("/cabinets/:slug", slugParam, validate, getBookingCabinet);
publicRoutes.get("/cabinets/:slug/busy", slugParam, validate, getBusySlots);
publicRoutes.post(
  "/cabinets/:slug/book",
  bookingLimiter,
  slugParam,
  body("serviceId").isMongoId(),
  body("startAt").isISO8601(),
  body("firstName").isString().trim().isLength({ min: 2, max: 60 }),
  body("lastName").isString().trim().isLength({ min: 2, max: 60 }),
  phone("phone"),
  body("email").optional({ values: "falsy" }).isEmail().normalizeEmail(),
  validate,
  bookAppointment
);

export const portalRoutes = Router();
portalRoutes.post("/login", loginLimiter, body("slug").isSlug(), phone("phone"), body("code").isString().trim().isLength({ min: 6, max: 6 }), validate, portalLogin);
portalRoutes.get("/me", protectPortal, portalMe);
portalRoutes.post("/appointments/:id/cancel", protectPortal, mongoIdParam, validate, portalCancelAppointment);
portalRoutes.get("/invoices/:id/pdf", protectPortal, mongoIdParam, validate, portalInvoicePdf);
