import { StatusCodes } from "http-status-codes";
import { User, type UserRole } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

const STAFF_ROLES: UserRole[] = ["ADMIN_TENANT", "MANAGER", "EMPLOYEE"];

function staffRole(value: unknown, fallback: UserRole): UserRole {
  return STAFF_ROLES.includes(value as UserRole) ? (value as UserRole) : fallback;
}

export const listEmployees = asyncHandler(async (req, res) => {
  const items = await User.find({ ...tenantFilter(req), role: { $in: STAFF_ROLES } }).sort({ isActive: -1, name: 1 });
  res.json({ success: true, items });
});

export const createEmployee = asyncHandler(async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw new ApiError(StatusCodes.CONFLICT, "Cet email est déjà utilisé");
  const tenant = await assertTenantLimit(req, "users");
  const employee = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    role: staffRole(req.body.role, "EMPLOYEE"),
    tenant
  });
  res.status(StatusCodes.CREATED).json({ success: true, employee });
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findOne({ _id: req.params.id, ...tenantFilter(req), role: { $in: STAFF_ROLES } });
  if (!employee) throw new ApiError(StatusCodes.NOT_FOUND, "Employé introuvable");

  const isSelf = String(employee._id) === String(req.user!._id);
  const nextRole = staffRole(req.body.role, employee.role);
  const nextActive = typeof req.body.isActive === "boolean" ? req.body.isActive : employee.isActive;
  if (isSelf && (nextRole !== employee.role || !nextActive)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Vous ne pouvez pas modifier votre propre rôle ni désactiver votre compte");
  }
  if (!employee.isActive && nextActive) await assertTenantLimit(req, "users", String(employee.tenant));

  if (typeof req.body.name === "string" && req.body.name.trim().length >= 2) employee.name = req.body.name.trim();
  if (typeof req.body.phone === "string") employee.phone = req.body.phone;
  employee.role = nextRole;
  employee.isActive = nextActive;
  if (typeof req.body.password === "string" && req.body.password) {
    if (req.body.password.length < 8) throw new ApiError(StatusCodes.BAD_REQUEST, "Mot de passe : 8 caractères minimum");
    employee.password = req.body.password;
    employee.tokenVersion += 1;
  }
  await employee.save();
  res.json({ success: true, employee: await User.findById(employee._id) });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user!._id)) throw new ApiError(StatusCodes.BAD_REQUEST, "Vous ne pouvez pas désactiver votre propre compte");
  const employee = await User.findOneAndUpdate({ _id: req.params.id, ...tenantFilter(req), role: { $in: STAFF_ROLES } }, { isActive: false }, { new: true });
  if (!employee) throw new ApiError(StatusCodes.NOT_FOUND, "Employé introuvable");
  res.json({ success: true });
});
