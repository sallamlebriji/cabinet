import { Router } from "express";
import { deleteDocument, listDocuments, uploadDocument } from "../controllers/document.controller.js";
import { allowRoles, checkTenantActive, protect, requireModule, scopeTenant } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import { mongoIdParam } from "../validators/common.validators.js";

export const documentRoutes = Router();
documentRoutes.use(protect);
documentRoutes.use(scopeTenant, checkTenantActive, requireModule("customers"));
documentRoutes.get("/", listDocuments);
documentRoutes.post("/", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE"), upload.single("file"), uploadDocument);
documentRoutes.delete("/:id", allowRoles("SUPER_ADMIN", "ADMIN_TENANT", "MANAGER"), mongoIdParam, validate, deleteDocument);
