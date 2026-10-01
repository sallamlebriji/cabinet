import { StatusCodes } from "http-status-codes";
import { Service } from "../models/Service.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

function serviceFields(body: Record<string, unknown>) {
  return {
    name: body.name,
    price: body.price,
    duration: body.duration,
    description: body.description,
    ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {})
  };
}

export const listServices = asyncHandler(async (req, res) => {
  const filter = req.user ? tenantFilter(req) : { isActive: true };
  res.json({ success: true, items: await Service.find(filter).sort({ createdAt: -1 }) });
});

export const createService = asyncHandler(async (req, res) => {
  const tenant = await assertTenantLimit(req, "items");
  const service = await Service.create({ ...serviceFields(req.body), tenant });
  res.status(StatusCodes.CREATED).json({ success: true, service });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, serviceFields(req.body), { new: true, runValidators: true });
  if (!service) throw new ApiError(StatusCodes.NOT_FOUND, "Service introuvable");
  res.json({ success: true, service });
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req) });
  if (!service) throw new ApiError(StatusCodes.NOT_FOUND, "Service introuvable");
  res.json({ success: true });
});
