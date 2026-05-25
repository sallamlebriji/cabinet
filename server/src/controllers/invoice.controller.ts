import PDFDocument from "pdfkit";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import { Invoice } from "../models/Invoice.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

export const listInvoices = asyncHandler(async (req, res) => {
  const items = await Invoice.find(tenantFilter(req)).populate("client").sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const tenant = await assertTenantLimit(req, "items");
  const subtotal = req.body.items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0);
  const tax = Number(req.body.tax ?? 0);
  const total = subtotal + tax;
  const invoice = await Invoice.create({
    ...req.body,
    tenant,
    number: `INV-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`,
    subtotal,
    tax,
    total
  });
  res.status(StatusCodes.CREATED).json({ success: true, invoice });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate("client");
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");
  res.json({ success: true, invoice });
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { status: req.body.status, paidAmount: req.body.paidAmount }, { new: true });
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");
  res.json({ success: true, invoice });
});

export const exportInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate("client");
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${invoice.number}.pdf`);

  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(res);
  doc.fontSize(22).text("Facture", { align: "right" });
  doc.fontSize(12).text(invoice.number).moveDown();
  invoice.items.forEach((item) => doc.text(`${item.label} x${item.quantity} - ${item.unitPrice} MAD`));
  doc.moveDown().fontSize(16).text(`Total: ${invoice.total} MAD`, { align: "right" });
  doc.end();
});
