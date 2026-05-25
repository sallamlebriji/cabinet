import { Notification } from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const filter = req.user!.role === "SUPER_ADMIN" ? { user: req.user!.id } : { user: req.user!.id, tenant: req.tenantId };
  const items = await Notification.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const filter = req.user!.role === "SUPER_ADMIN" ? { _id: req.params.id, user: req.user!.id } : { _id: req.params.id, user: req.user!.id, tenant: req.tenantId };
  const notification = await Notification.findOneAndUpdate(filter, { read: true }, { new: true });
  res.json({ success: true, notification });
});
