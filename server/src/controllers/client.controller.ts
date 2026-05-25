import { StatusCodes } from "http-status-codes";
import { Client } from "../models/Client.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

export const listClients = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? "");
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const filter = { ...tenantFilter(req), ...(q ? { $text: { $search: q } } : {}) };
  const [items, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Client.countDocuments(filter)
  ]);
  res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) });
});

export const createClient = asyncHandler(async (req, res) => {
  const tenant = await assertTenantLimit(req, "items");
  const client = await Client.create({ ...req.body, tenant, createdBy: req.user!.id });
  res.status(StatusCodes.CREATED).json({ success: true, client });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, ...tenantFilter(req) });
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  res.json({ success: true, client });
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true, runValidators: true });
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  res.json({ success: true, client });
});

export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req) });
  if (!client) throw new ApiError(StatusCodes.NOT_FOUND, "Client introuvable");
  res.json({ success: true });
});
