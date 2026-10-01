import { StatusCodes } from "http-status-codes";
import { Appointment } from "../models/Appointment.js";
import { Client } from "../models/Client.js";
import { DocumentFile } from "../models/Document.js";
import { Invoice } from "../models/Invoice.js";
import { Payment } from "../models/Payment.js";
import { Quote } from "../models/Quote.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { effectiveModules } from "../utils/permissions.js";
import { generateCode, phoneKey } from "../utils/phone.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function clientFields(body: Record<string, unknown>) {
  const tags = Array.isArray(body.tags) ? body.tags.map((tag) => String(tag).trim()).filter(Boolean) : undefined;
  return {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email || undefined,
    phone: body.phone || undefined,
    phoneKey: phoneKey(body.phone),
    address: body.address || undefined,
    birthDate: body.birthDate || undefined,
    notes: body.notes,
    ...(tags ? { tags } : {})
  };
}

export const listClients = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 200);
  const search = q
    ? { $or: ["firstName", "lastName", "email", "phone"].map((field) => ({ [field]: { $regex: escapeRegex(q), $options: "i" } })) }
    : {};
  const filter = { ...tenantFilter(req), ...search };
  const [items, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Client.countDocuments(filter)
  ]);
  res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) });
});

export const createClient = asyncHandler(async (req, res) => {
  const tenant = await assertTenantLimit(req, "items");
  const client = await Client.create({ ...clientFields(req.body), tenant, createdBy: req.user!.id, portalCode: generateCode() });
  res.status(StatusCodes.CREATED).json({ success: true, client });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, ...tenantFilter(req) });
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  res.json({ success: true, client });
});

export const getClientOverview = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, ...tenantFilter(req) }).select("+portalCode");
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  if (!client.portalCode) {
    client.portalCode = generateCode();
    await client.save();
  }

  const modules = effectiveModules(req.user!.role, req.tenant, req.subscription);
  const canBilling = modules.includes("billing");
  const scope = { client: client._id, tenant: client.tenant };
  const [appointments, documents, invoices, quotes, payments] = await Promise.all([
    Appointment.find(scope).populate("service employee").sort({ startAt: -1 }),
    DocumentFile.find(scope).sort({ createdAt: -1 }),
    canBilling ? Invoice.find(scope).sort({ createdAt: -1 }) : [],
    canBilling ? Quote.find(scope).sort({ createdAt: -1 }) : [],
    canBilling ? Payment.find(scope).populate("invoice", "number").sort({ paidAt: -1 }) : []
  ]);

  const billed = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const paid = invoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
  res.json({
    success: true,
    client,
    appointments,
    documents,
    invoices,
    quotes,
    payments,
    canBilling,
    totals: { billed, paid, balance: Math.max(billed - paid, 0), visits: appointments.filter((item) => item.status === "completed").length }
  });
});

export const regeneratePortalCode = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { portalCode: generateCode() }, { new: true }).select("+portalCode");
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  res.json({ success: true, portalCode: client.portalCode });
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, clientFields(req.body), { new: true, runValidators: true });
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  res.json({ success: true, client });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req) });
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  res.json({ success: true });
});
