import { StatusCodes } from "http-status-codes";
import { Appointment } from "../models/Appointment.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

export const listAppointments = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { ...tenantFilter(req) };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.startAt = {
      ...(req.query.from ? { $gte: new Date(String(req.query.from)) } : {}),
      ...(req.query.to ? { $lte: new Date(String(req.query.to)) } : {})
    };
  }
  const items = await Appointment.find(filter).populate("client service employee").sort({ startAt: 1 });
  res.json({ success: true, items });
});

export const createAppointment = asyncHandler(async (req, res) => {
  const tenant = await assertTenantLimit(req, "items");
  const appointment = await Appointment.create({ ...req.body, tenant });
  res.status(StatusCodes.CREATED).json({ success: true, appointment });
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true, runValidators: true });
  if (!appointment) throw new ApiError(StatusCodes.NOT_FOUND, "Rendez-vous introuvable");
  res.json({ success: true, appointment });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { status: req.body.status }, { new: true });
  if (!appointment) throw new ApiError(StatusCodes.NOT_FOUND, "Rendez-vous introuvable");
  res.json({ success: true, appointment });
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req) });
  if (!appointment) throw new ApiError(StatusCodes.NOT_FOUND, "Rendez-vous introuvable");
  res.json({ success: true });
});
