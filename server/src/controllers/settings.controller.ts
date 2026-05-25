import { Setting } from "../models/Setting.js";
import { Tenant } from "../models/Tenant.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { tenantFilter, tenantIdForWrite } from "../utils/tenant.js";

export const getSettings = asyncHandler(async (req, res) => {
  const filter = req.user ? tenantFilter(req) : {};
  const settings = await Setting.findOne(filter).sort({ createdAt: 1 });
  res.json({ success: true, settings });
});

export const getPublicCabinet = asyncHandler(async (req, res) => {
  const slug = typeof req.query.slug === "string" ? req.query.slug : "cabinet-atlas";
  const tenant = await Tenant.findOne({ slug, isActive: true });
  const settings = tenant ? await Setting.findOne({ tenant: tenant._id }) : null;
  res.json({ success: true, settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const tenant = tenantIdForWrite(req);
  const settings = await Setting.findOneAndUpdate({ tenant }, { ...req.body, tenant }, { upsert: true, new: true, runValidators: true });
  res.json({ success: true, settings });
});
