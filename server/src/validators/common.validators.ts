import { body, param } from "express-validator";

export const mongoIdParam = [param("id").isMongoId()];

export const clientValidator = [
  body("firstName").isString().trim().notEmpty(),
  body("lastName").isString().trim().notEmpty(),
  body("email").optional({ values: "falsy" }).isEmail().normalizeEmail()
];

export const serviceValidator = [
  body("name").isString().trim().notEmpty(),
  body("price").isFloat({ min: 0 }),
  body("duration").isInt({ min: 5 })
];

export const appointmentValidator = [
  body("client").isMongoId(),
  body("service").isMongoId(),
  body("employee").optional({ values: "falsy" }).isMongoId(),
  body("tenantId").optional({ values: "falsy" }).isMongoId(),
  body("tenant").optional({ values: "falsy" }).isMongoId(),
  body("cabinet").optional({ values: "falsy" }).isMongoId(),
  body("startAt").isISO8601(),
  body("endAt").isISO8601()
];

export const invoiceValidator = [
  body("client").isMongoId(),
  body("items").isArray({ min: 1 }),
  body("items.*.label").isString().notEmpty(),
  body("items.*.quantity").isInt({ min: 1 }),
  body("items.*.unitPrice").isFloat({ min: 0 })
];
