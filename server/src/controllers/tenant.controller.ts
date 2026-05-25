import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { planLimits } from "../config/modules.js";
import { env } from "../config/env.js";
import { Appointment } from "../models/Appointment.js";
import { Client } from "../models/Client.js";
import { DocumentFile } from "../models/Document.js";
import { Invoice } from "../models/Invoice.js";
import { Notification } from "../models/Notification.js";
import { Service } from "../models/Service.js";
import { Setting } from "../models/Setting.js";
import { Subscription } from "../models/Subscription.js";
import { Tenant } from "../models/Tenant.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAccessToken } from "../utils/tokens.js";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let index = 2;
  while (await Tenant.exists({ slug })) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
}

function defaultModules() {
  return {
    dashboard: true,
    users: true,
    customers: true,
    appointments: true,
    billing: true,
    reports: true,
    settings: true
  };
}

function moduleKeys(modules: unknown) {
  if (modules instanceof Map) return [...modules.entries()].filter(([, enabled]) => enabled).map(([module]) => module);
  if (modules && typeof modules === "object") return Object.entries(modules as Record<string, boolean>).filter(([, enabled]) => enabled).map(([module]) => module);
  return Object.keys(defaultModules());
}

export const listTenants = asyncHandler(async (_req, res) => {
  const items = await Tenant.find().sort({ createdAt: -1 });
  const counts = await User.aggregate([{ $match: { tenant: { $ne: null } } }, { $group: { _id: "$tenant", users: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.users]));
  res.json({ success: true, items: items.map((tenant) => ({ ...tenant.toObject(), usersCount: countMap.get(String(tenant._id)) ?? 0 })) });
});

export const getTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) throw new ApiError(StatusCodes.NOT_FOUND, "Tenant introuvable");
  const subscription = await Subscription.findOne({ tenant: tenant._id });
  res.json({ success: true, tenant, subscription });
});

export const provisionTenant = asyncHandler(async (req, res) => {
  const admin = req.body.admin ?? {};
  if (!req.body.name || !admin.email || !admin.password || !admin.name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "name et admin{name,email,password} sont requis");
  }

  const exists = await User.findOne({ email: admin.email });
  if (exists) throw new ApiError(StatusCodes.CONFLICT, "Email admin deja utilise");

  const plan = req.body.plan ?? "FREE";
  const tenant = await Tenant.create({
    name: req.body.name,
    slug: await uniqueSlug(req.body.slug || req.body.name),
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    logo: req.body.logo,
    primaryColor: req.body.primaryColor ?? "#2563eb",
    plan,
    modules: req.body.modules ?? defaultModules()
  });

  const limits = planLimits[plan as keyof typeof planLimits] ?? planLimits.FREE;
  const enabledModules = moduleKeys(tenant.modules);
  const subscription = await Subscription.create({
    tenant: tenant._id,
    plan,
    status: req.body.subscriptionStatus ?? "trial",
    startDate: new Date(),
    ...limits,
    enabledModules
  });

  const settings = await Setting.create({
    tenant: tenant._id,
    cabinetName: tenant.name,
    slug: tenant.slug,
    email: tenant.email,
    phone: tenant.phone,
    address: tenant.address,
    logo: tenant.logo,
    plan: "trial",
    status: "active",
    preferences: { primaryColor: tenant.primaryColor }
  });

  const adminUser = await User.create({
    name: admin.name,
    email: admin.email,
    password: admin.password,
    phone: admin.phone,
    role: "ADMIN_TENANT",
    tenant: tenant._id
  });

  if (req.body.withDemoData) {
    const service = await Service.create({ tenant: tenant._id, name: "Consultation initiale", duration: 45, price: 500, isActive: true });
    const client = await Client.create({ tenant: tenant._id, firstName: "Client", lastName: "Demo", email: `client-${tenant.slug}@example.com`, createdBy: adminUser._id });
    const startAt = new Date();
    startAt.setHours(10, 0, 0, 0);
    await Appointment.create({ tenant: tenant._id, client: client._id, service: service._id, startAt, endAt: new Date(startAt.getTime() + 45 * 60_000), status: "confirmed" });
  }

  res.status(StatusCodes.CREATED).json({ success: true, tenant, admin: adminUser, settings, subscription });
});

export const updateTenant = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.slug) payload.slug = slugify(payload.slug);
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!tenant) throw new ApiError(StatusCodes.NOT_FOUND, "Tenant introuvable");

  const subscriptionPatch: Record<string, unknown> = {};
  if (payload.plan) {
    const limits = planLimits[payload.plan as keyof typeof planLimits] ?? planLimits.FREE;
    Object.assign(subscriptionPatch, { plan: payload.plan, ...limits });
  }
  if (payload.modules) subscriptionPatch.enabledModules = moduleKeys(payload.modules);
  if (Object.keys(subscriptionPatch).length) {
    await Subscription.findOneAndUpdate({ tenant: tenant._id }, subscriptionPatch, { new: true, upsert: true, runValidators: true });
  }

  res.json({ success: true, tenant });
});

export const toggleTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);
  if (!tenant) throw new ApiError(StatusCodes.NOT_FOUND, "Tenant introuvable");
  tenant.isActive = !tenant.isActive;
  await tenant.save();
  res.json({ success: true, tenant });
});

export const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndDelete(req.params.id);
  if (!tenant) throw new ApiError(StatusCodes.NOT_FOUND, "Tenant introuvable");
  await Promise.all([
    Subscription.deleteOne({ tenant: req.params.id }),
    Setting.deleteOne({ tenant: req.params.id }),
    User.updateMany({ tenant: req.params.id }, { isActive: false }),
    Client.deleteMany({ tenant: req.params.id }),
    Service.deleteMany({ tenant: req.params.id }),
    Appointment.deleteMany({ tenant: req.params.id }),
    Invoice.deleteMany({ tenant: req.params.id }),
    DocumentFile.deleteMany({ tenant: req.params.id }),
    Notification.deleteMany({ tenant: req.params.id })
  ]);
  res.json({ success: true });
});

export const getTenantStats = asyncHandler(async (req, res) => {
  const tenant = req.params.id;
  const [users, clients, services, appointments, invoices] = await Promise.all([
    User.countDocuments({ tenant }),
    Client.countDocuments({ tenant }),
    Service.countDocuments({ tenant }),
    Appointment.countDocuments({ tenant }),
    Invoice.countDocuments({ tenant })
  ]);
  res.json({ success: true, stats: { users, clients, services, appointments, invoices } });
});

export const impersonateTenant = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ tenant: req.params.id, role: "ADMIN_TENANT", isActive: true });
  if (!admin) throw new ApiError(StatusCodes.NOT_FOUND, "Aucun admin actif pour ce tenant");
  res.json({ success: true, accessToken: signAccessToken(admin), user: admin });
});

export const issueTenantPreviewToken = asyncHandler(async (req, res) => {
  const token = jwt.sign({ tenantId: req.params.id, preview: true }, env.jwtAccessSecret, { expiresIn: "10m" });
  res.json({ success: true, token });
});
