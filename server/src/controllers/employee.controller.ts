import { StatusCodes } from "http-status-codes";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

export const listEmployees = asyncHandler(async (req, res) => {
  const items = await User.find({ ...tenantFilter(req), role: { $in: ["ADMIN_TENANT", "MANAGER", "EMPLOYEE"] } }).sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new ApiError(StatusCodes.CONFLICT, "Cet email est déjà utilisé");
  const tenant = await assertTenantLimit(req, "users");
  const employee = await User.create({ ...req.body, role: req.body.role ?? "EMPLOYEE", tenant });
  res.status(StatusCodes.CREATED).json({ success: true, employee });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, req.body, { new: true, runValidators: true });
  if (!employee) throw new ApiError(StatusCodes.NOT_FOUND, "Employé introuvable");
  res.json({ success: true, employee });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req) }, { isActive: false }, { new: true });
  if (!employee) throw new ApiError(StatusCodes.NOT_FOUND, "Employé introuvable");
  res.json({ success: true });
});
