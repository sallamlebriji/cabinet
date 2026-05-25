import { Router } from "express";
import { createInvoice, exportInvoicePdf, getInvoice, listInvoices, updateInvoiceStatus } from "../controllers/invoice.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { invoiceValidator, mongoIdParam } from "../validators/common.validators.js";

export const invoiceRoutes = Router();
invoiceRoutes.use(protect);
invoiceRoutes.use(scopeTenant, checkTenantActive, requireModule("billing"));
invoiceRoutes.get("/", listInvoices);
invoiceRoutes.post("/", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"), invoiceValidator, validate, createInvoice);
invoiceRoutes.get("/:id", mongoIdParam, validate, getInvoice);
invoiceRoutes.patch("/:id/status", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"), mongoIdParam, validate, updateInvoiceStatus);
invoiceRoutes.get("/:id/pdf", mongoIdParam, validate, exportInvoicePdf);
