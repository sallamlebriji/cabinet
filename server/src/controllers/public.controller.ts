import { StatusCodes } from "http-status-codes";
import { Appointment } from "../models/Appointment.js";
import { Client } from "../models/Client.js";
import { Service } from "../models/Service.js";
import { Setting } from "../models/Setting.js";
import { Subscription } from "../models/Subscription.js";
import { Tenant } from "../models/Tenant.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateCode, phoneKey } from "../utils/phone.js";

const DAY = 24 * 60 * 60 * 1000;

export async function findPublicTenant(slug: unknown) {
  const tenant = typeof slug === "string" ? await Tenant.findOne({ slug: slug.toLowerCase(), isActive: true }) : null;
  if (!tenant) throw new ApiError(StatusCodes.NOT_FOUND, "Cabinet introuvable");
  const subscription = await Subscription.findOne({ tenant: tenant._id });
  if (!subscription || subscription.status === "canceled" || (subscription.endDate && subscription.endDate < new Date())) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Cabinet introuvable");
  }
  return tenant;
}

export async function findClientByPhone(tenantId: unknown, phone: unknown) {
  const key = phoneKey(phone);
  if (!key) return null;
  const direct = await Client.findOne({ tenant: tenantId, phoneKey: key });
  if (direct) return direct;
  // Fiches créées avant l'ajout de phoneKey : comparaison en mémoire, puis mise à jour de la clé.
  const legacy = await Client.find({ tenant: tenantId, phone: { $exists: true, $ne: "" }, phoneKey: { $in: [null, ""] } });
  const match = legacy.find((client) => phoneKey(client.phone) === key) ?? null;
  if (match) {
    match.phoneKey = key;
    await match.save();
  }
  return match;
}

export const getBookingCabinet = asyncHandler(async (req, res) => {
  const tenant = await findPublicTenant(req.params.slug);
  const [settings, services] = await Promise.all([
    Setting.findOne({ tenant: tenant._id }),
    Service.find({ tenant: tenant._id, isActive: true }).select("name duration price description").sort({ name: 1 })
  ]);
  res.json({
    success: true,
    cabinet: {
      name: settings?.cabinetName ?? tenant.name,
      slug: tenant.slug,
      phone: settings?.phone ?? tenant.phone,
      email: settings?.email ?? tenant.email,
      address: settings?.address ?? tenant.address,
      openingHours: settings?.openingHours ?? []
    },
    services
  });
});

export const getBusySlots = asyncHandler(async (req, res) => {
  const tenant = await findPublicTenant(req.params.slug);
  const from = new Date(String(req.query.from));
  const to = new Date(String(req.query.to));
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to.getTime() - from.getTime() > 2 * DAY || to <= from) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Période invalide");
  }
  const items = await Appointment.find({ tenant: tenant._id, status: { $ne: "cancelled" }, startAt: { $lt: to }, endAt: { $gt: from } }).select("startAt endAt -_id");
  res.json({ success: true, items });
});

export const bookAppointment = asyncHandler(async (req, res) => {
  const tenant = await findPublicTenant(req.params.slug);
  const service = await Service.findOne({ _id: req.body.serviceId, tenant: tenant._id, isActive: true });
  if (!service) throw new ApiError(StatusCodes.BAD_REQUEST, "Service introuvable");

  const startAt = new Date(req.body.startAt);
  const now = Date.now();
  if (startAt.getTime() < now + 30 * 60 * 1000 || startAt.getTime() > now + 90 * DAY) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Ce créneau n'est pas réservable");
  }
  const endAt = new Date(startAt.getTime() + service.duration * 60 * 1000);

  const conflict = await Appointment.exists({ tenant: tenant._id, status: { $ne: "cancelled" }, startAt: { $lt: endAt }, endAt: { $gt: startAt } });
  if (conflict) throw new ApiError(StatusCodes.CONFLICT, "Ce créneau vient d'être réservé. Choisissez-en un autre.");

  let client = await findClientByPhone(tenant._id, req.body.phone);
  if (!client) {
    client = await Client.create({
      tenant: tenant._id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      phoneKey: phoneKey(req.body.phone),
      email: req.body.email || undefined,
      tags: ["en ligne"],
      portalCode: generateCode()
    });
  }

  const upcoming = await Appointment.countDocuments({ tenant: tenant._id, client: client._id, status: { $in: ["pending", "confirmed"] }, startAt: { $gt: new Date() } });
  if (upcoming >= 3) throw new ApiError(StatusCodes.CONFLICT, "Vous avez déjà plusieurs rendez-vous à venir. Contactez le cabinet.");

  const appointment = await Appointment.create({
    tenant: tenant._id,
    client: client._id,
    service: service._id,
    startAt,
    endAt,
    status: "pending",
    source: "online",
    notes: typeof req.body.notes === "string" ? req.body.notes.slice(0, 500) : undefined
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    appointment: { id: appointment._id, startAt, endAt, service: service.name, status: appointment.status }
  });
});
