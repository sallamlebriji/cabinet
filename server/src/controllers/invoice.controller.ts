import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import { Client } from "../models/Client.js";
import { Invoice } from "../models/Invoice.js";
import { Payment } from "../models/Payment.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeTotals, round, sendBillingPdf, statusFor } from "../utils/billing.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

export const listInvoices = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { ...tenantFilter(req) };
  if (typeof req.query.client === "string") filter.client = req.query.client;
  const items = await Invoice.find(filter).populate("client").sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const tenant = await assertTenantLimit(req, "items");
  const client = await Client.findOne({ _id: req.body.client, tenant });
  if (!client) throw new ApiError(StatusCodes.BAD_REQUEST, "Client introuvable dans ce cabinet");
  const totals = computeTotals(req.body.items, req.body.taxRate);
  const invoice = await Invoice.create({
    tenant,
    client: client._id,
    number: `FAC-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`,
    ...totals,
    dueDate: req.body.dueDate || undefined,
    notes: req.body.notes
  });
  res.status(StatusCodes.CREATED).json({ success: true, invoice });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate("client");
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");
  const payments = await Payment.find({ invoice: invoice._id }).sort({ paidAt: -1 });
  res.json({ success: true, invoice, payments });
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { status: req.body.status, paidAmount: req.body.paidAmount }, { new: true });
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");
  res.json({ success: true, invoice });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, ...tenantFilter(req) });
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");
  if (invoice.paidAmount > 0) throw new ApiError(StatusCodes.CONFLICT, "Impossible de supprimer une facture ayant des paiements");
  await invoice.deleteOne();
  res.json({ success: true });
});

export const exportInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate<{ client: InstanceType<typeof Client> }>("client");
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");
  await sendBillingPdf(res, {
    kind: "Facture",
    number: invoice.number,
    date: invoice.createdAt,
    tenantId: invoice.tenant,
    client: invoice.client,
    items: invoice.items,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    paidAmount: invoice.paidAmount
  });
});

export const addPayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ _id: req.params.id, ...tenantFilter(req) });
  if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, "Facture introuvable");
  const amount = round(Number(req.body.amount));
  const remaining = round(invoice.total - invoice.paidAmount);
  if (!(amount > 0)) throw new ApiError(StatusCodes.BAD_REQUEST, "Montant invalide");
  if (amount > remaining) throw new ApiError(StatusCodes.BAD_REQUEST, `Le montant dépasse le reste à payer (${remaining} MAD)`);

  const payment = await Payment.create({
    tenant: invoice.tenant,
    invoice: invoice._id,
    client: invoice.client,
    amount,
    method: req.body.method,
    paidAt: req.body.paidAt || new Date(),
    reference: req.body.reference,
    recordedBy: req.user!.id
  });
  invoice.paidAmount = round(invoice.paidAmount + amount);
  invoice.status = statusFor(invoice.total, invoice.paidAmount);
  await invoice.save();
  res.status(StatusCodes.CREATED).json({ success: true, payment, invoice });
});

export const listPayments = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { ...tenantFilter(req) };
  if (typeof req.query.client === "string") filter.client = req.query.client;
  const items = await Payment.find(filter).populate("client").populate("invoice", "number total").sort({ paidAt: -1 }).limit(500);
  res.json({ success: true, items });
});

export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req) });
  if (!payment) throw new ApiError(StatusCodes.NOT_FOUND, "Paiement introuvable");
  const invoice = await Invoice.findById(payment.invoice);
  if (invoice) {
    invoice.paidAmount = Math.max(round(invoice.paidAmount - payment.amount), 0);
    invoice.status = statusFor(invoice.total, invoice.paidAmount);
    await invoice.save();
  }
  res.json({ success: true });
});
