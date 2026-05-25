import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import type { Request } from "express";
import { Appointment } from "../models/Appointment.js";
import { Client } from "../models/Client.js";
import { DocumentFile } from "../models/Document.js";
import { Invoice } from "../models/Invoice.js";
import { Service } from "../models/Service.js";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";
import { ApiError } from "./apiError.js";

export function tenantFilter(req: Request) {
  if (req.user?.role === "SUPER_ADMIN") {
    const tenantId = req.tenantId ?? (typeof req.query.tenantId === "string" ? req.query.tenantId : undefined);
    return tenantId ? { tenant: new mongoose.Types.ObjectId(tenantId) } : {};
  }

  if (!req.tenantId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Aucun tenant associe a cet utilisateur");
  }

  return { tenant: new mongoose.Types.ObjectId(req.tenantId) };
}

export function tenantIdForWrite(req: Request) {
  if (req.user?.role === "SUPER_ADMIN") {
    const tenantId = req.body.tenantId ?? req.body.tenant ?? req.query.tenantId;
    if (!tenantId || !mongoose.isValidObjectId(tenantId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "tenantId requis pour cette operation");
    }
    return tenantId;
  }

  if (!req.tenantId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Aucun tenant associe a cet utilisateur");
  }

  return req.tenantId;
}

export const cabinetFilter = tenantFilter;
export const cabinetIdForWrite = tenantIdForWrite;

type LimitedResource = "users" | "items";

const itemCounters = [
  (tenant: string) => Client.countDocuments({ tenant }),
  (tenant: string) => Service.countDocuments({ tenant }),
  (tenant: string) => Appointment.countDocuments({ tenant }),
  (tenant: string) => Invoice.countDocuments({ tenant }),
  (tenant: string) => DocumentFile.countDocuments({ tenant })
];

export async function assertTenantLimit(req: Request, resource: LimitedResource, tenantId = tenantIdForWrite(req)) {
  const subscription = req.subscription ?? (await Subscription.findOne({ tenant: tenantId }));
  if (!subscription || subscription.status === "canceled") {
    throw new ApiError(StatusCodes.FORBIDDEN, "Abonnement inactif");
  }

  if (resource === "users") {
    const users = await User.countDocuments({ tenant: tenantId, isActive: true });
    if (users >= subscription.maxUsers) {
      throw new ApiError(StatusCodes.FORBIDDEN, "Limite utilisateurs atteinte pour ce plan");
    }
    return tenantId;
  }

  const counts = await Promise.all(itemCounters.map((countItems) => countItems(tenantId)));
  const totalItems = counts.reduce((sum, count) => sum + count, 0);
  if (totalItems >= subscription.maxItems) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Limite d'elements atteinte pour ce plan");
  }

  return tenantId;
}
