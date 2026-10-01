import jwt from "jsonwebtoken";
import { timingSafeEqual } from "node:crypto";
import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { Appointment } from "../models/Appointment.js";
import { Client } from "../models/Client.js";
import { Invoice } from "../models/Invoice.js";
import { Setting } from "../models/Setting.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendBillingPdf } from "../utils/billing.js";
import { findClientByPhone, findPublicTenant } from "./public.controller.js";

type PortalPayload = { sub: string; tenantId: string; kind: "portal" };
type PortalRequest = Request & { portal?: { clientId: string; tenantId: string } };

function sameCode(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function protectPortal(req: PortalRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  try {
    const payload = jwt.verify(token ?? "", env.jwtAccessSecret) as PortalPayload;
    if (payload.kind !== "portal") throw new Error("kind");
    req.portal = { clientId: payload.sub, tenantId: payload.tenantId };
    next();
  } catch {
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Session expirée"));
  }
}

export const portalLogin = asyncHandler(async (req, res) => {
  const tenant = await findPublicTenant(req.body.slug);
  const match = await findClientByPhone(tenant._id, req.body.phone);
  const client = match ? await Client.findById(match._id).select("+portalCode") : null;
  const code = String(req.body.code ?? "").trim();
  if (!client?.portalCode || !sameCode(client.portalCode, code)) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Numéro ou code d'accès incorrect");
  }
  const token = jwt.sign({ sub: client.id, tenantId: String(tenant._id), kind: "portal" } satisfies PortalPayload, env.jwtAccessSecret, { expiresIn: "2h" });
  res.json({ success: true, token });
});

export const portalMe = asyncHandler(async (req: PortalRequest, res) => {
  const { clientId, tenantId } = req.portal!;
  const client = await Client.findOne({ _id: clientId, tenant: tenantId }).select("firstName lastName email phone");
  if (!client) throw new ApiError(StatusCodes.UNAUTHORIZED, "Session expirée");
  const [settings, appointments, invoices] = await Promise.all([
    Setting.findOne({ tenant: tenantId }).select("cabinetName slug phone email address"),
    Appointment.find({ client: clientId, tenant: tenantId }).populate("service", "name duration").select("startAt endAt status service").sort({ startAt: -1 }).limit(50),
    Invoice.find({ client: clientId, tenant: tenantId }).select("number total paidAmount status createdAt").sort({ createdAt: -1 }).limit(50)
  ]);
  res.json({ success: true, client, cabinet: settings, appointments, invoices });
});

export const portalCancelAppointment = asyncHandler(async (req: PortalRequest, res) => {
  const { clientId, tenantId } = req.portal!;
  const appointment = await Appointment.findOne({ _id: req.params.id, client: clientId, tenant: tenantId });
  if (!appointment) throw new ApiError(StatusCodes.NOT_FOUND, "Rendez-vous introuvable");
  if (!["pending", "confirmed"].includes(appointment.status) || appointment.startAt <= new Date()) {
    throw new ApiError(StatusCodes.CONFLICT, "Ce rendez-vous ne peut plus être annulé");
  }
  appointment.status = "cancelled";
  await appointment.save();
  res.json({ success: true });
});

export const portalInvoicePdf = asyncHandler(async (req: PortalRequest, res) => {
  const { clientId, tenantId } = req.portal!;
  const invoice = await Invoice.findOne({ _id: req.params.id, client: clientId, tenant: tenantId }).populate<{ client: InstanceType<typeof Client> }>("client");
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
