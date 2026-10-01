import { Router } from "express";
import { body } from "express-validator";
import { convertQuote, createQuote, deleteQuote, exportQuotePdf, listQuotes, updateQuoteStatus } from "../controllers/quote.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { invoiceValidator, mongoIdParam } from "../validators/common.validators.js";

export const quoteRoutes = Router();
quoteRoutes.use(protect, scopeTenant, checkTenantActive, requireModule("billing"));
quoteRoutes.get("/", listQuotes);
quoteRoutes.post("/", invoiceValidator, validate, createQuote);
quoteRoutes.patch("/:id/status", mongoIdParam, body("status").isIn(["draft", "sent", "accepted", "refused"]), validate, updateQuoteStatus);
quoteRoutes.post("/:id/convert", mongoIdParam, validate, convertQuote);
quoteRoutes.get("/:id/pdf", mongoIdParam, validate, exportQuotePdf);
quoteRoutes.delete("/:id", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"), mongoIdParam, validate, deleteQuote);
