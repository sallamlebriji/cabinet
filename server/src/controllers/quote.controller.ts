import type mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import { Client } from "../models/Client.js";
import { Invoice } from "../models/Invoice.js";
import { Quote } from "../models/Quote.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { computeTotals, sendBillingPdf } from "../utils/billing.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

export const listQuotes = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { ...tenantFilter(req) };
  if (typeof req.query.client === "string") filter.client = req.query.client;
  const items = await Quote.find(filter).populate("client").populate("invoice", "number").sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const createQuote = asyncHandler(async (req, res) => {
  const tenant = await assertTenantLimit(req, "items");
  const client = await Client.findOne({ _id: req.body.client, tenant });
  if (!client) throw new ApiError(StatusCodes.BAD_REQUEST, "Client introuvable dans ce cabinet");
  const quote = await Quote.create({
    tenant,
    client: client._id,
    number: `DEV-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`,
    ...computeTotals(req.body.items, req.body.taxRate),
    validUntil: req.body.validUntil || undefined,
    notes: req.body.notes
  });
  res.status(StatusCodes.CREATED).json({ success: true, quote });
});

export const updateQuoteStatus = asyncHandler(async (req, res) => {
  const quote = await Quote.findOne({ _id: req.params.id, ...tenantFilter(req) });
  if (!quote) throw new ApiError(StatusCodes.NOT_FOUND, "Devis introuvable");
  if (quote.invoice) throw new ApiError(StatusCodes.CONFLICT, "Ce devis a déjà été facturé");
  quote.status = req.body.status;
  await quote.save();
  res.json({ success: true, quote });
});

export const convertQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findOne({ _id: req.params.id, ...tenantFilter(req) });
  if (!quote) throw new ApiError(StatusCodes.NOT_FOUND, "Devis introuvable");
  if (quote.invoice) throw new ApiError(StatusCodes.CONFLICT, "Ce devis a déjà été facturé");
  const invoice = await Invoice.create({
    tenant: quote.tenant,
    client: quote.client,
    number: `FAC-${new Date().getFullYear()}-${nanoid(6).toUpperCase()}`,
    items: quote.items.map((item) => ({ label: item.label, quantity: item.quantity, unitPrice: item.unitPrice })),
    subtotal: quote.subtotal,
    tax: quote.tax,
    total: quote.total
  });
  quote.status = "accepted";
  quote.invoice = invoice._id as mongoose.Types.ObjectId;
  await quote.save();
  res.status(StatusCodes.CREATED).json({ success: true, quote, invoice });
});

export const deleteQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req), invoice: { $exists: false } });
  if (!quote) throw new ApiError(StatusCodes.NOT_FOUND, "Devis introuvable ou déjà facturé");
  res.json({ success: true });
});

export const exportQuotePdf = asyncHandler(async (req, res) => {
  const quote = await Quote.findOne({ _id: req.params.id, ...tenantFilter(req) }).populate<{ client: InstanceType<typeof Client> }>("client");
  if (!quote) throw new ApiError(StatusCodes.NOT_FOUND, "Devis introuvable");
  await sendBillingPdf(res, {
    kind: "Devis",
    number: quote.number,
    date: quote.createdAt,
    tenantId: quote.tenant,
    client: quote.client,
    items: quote.items,
    subtotal: quote.subtotal,
    tax: quote.tax,
    total: quote.total,
    footer: quote.validUntil ? `Devis valable jusqu'au ${quote.validUntil.toLocaleDateString("fr-FR")}.` : undefined
  });
});
