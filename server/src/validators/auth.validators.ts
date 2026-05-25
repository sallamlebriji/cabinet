import { body } from "express-validator";

export const registerValidator = [
  body("name").isString().trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE", "CLIENT"]),
  body("tenantName").optional().isString().trim().isLength({ min: 2 }),
  body("cabinetName").optional().isString().trim().isLength({ min: 2 })
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty()
];

export const resetPasswordValidator = [
  body("token").isString().notEmpty(),
  body("password").isLength({ min: 8 })
];
