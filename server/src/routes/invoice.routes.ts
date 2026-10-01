import { Router } from "express";
import { body } from "express-validator";
import {
  addPayment,
  createInvoice,
  deleteInvoice,
  deletePayment,
  exportInvoicePdf,
  getInvoice,
  listInvoices,
  listPayments,
  updateInvoiceStatus
} from "../controllers/invoice.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { invoiceValidator, mongoIdParam } from "../validators/common.validators.js";

const managers = allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER");

export const invoiceRoutes = Router();
invoiceRoutes.use(protect);
invoiceRoutes.use(scopeTenant, checkTenantActive, requireModule("billing"));
invoiceRoutes.get("/", listInvoices);
invoiceRoutes.post("/", invoiceValidator, validate, createInvoice);
invoiceRoutes.get("/:id", mongoIdParam, validate, getInvoice);
invoiceRoutes.patch("/:id/status", managers, mongoIdParam, body("status").isIn(["paid", "unpaid", "partial"]), body("paidAmount").isFloat({ min: 0 }), validate, updateInvoiceStatus);
invoiceRoutes.get("/:id/pdf", mongoIdParam, validate, exportInvoicePdf);
invoiceRoutes.delete("/:id", managers, mongoIdParam, validate, deleteInvoice);
invoiceRoutes.post(
  "/:id/payments",
  mongoIdParam,
  body("amount").isFloat({ gt: 0 }),
  body("method").isIn(["cash", "card", "transfer", "cheque"]),
  body("paidAt").optional({ values: "falsy" }).isISO8601(),
  body("reference").optional({ values: "falsy" }).isString().isLength({ max: 80 }),
  validate,
  addPayment
);

export const paymentRoutes = Router();
paymentRoutes.use(protect, scopeTenant, checkTenantActive, requireModule("billing"));
paymentRoutes.get("/", listPayments);
paymentRoutes.delete("/:id", managers, mongoIdParam, validate, deletePayment);
