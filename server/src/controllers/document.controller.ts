import { StatusCodes } from "http-status-codes";
import { DocumentFile } from "../models/Document.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertTenantLimit, tenantFilter } from "../utils/tenant.js";

export const listDocuments = asyncHandler(async (req, res) => {
  const items = await DocumentFile.find(tenantFilter(req)).populate("client uploadedBy").sort({ createdAt: -1 });
  res.json({ success: true, items });
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(StatusCodes.BAD_REQUEST, "Fichier manquant");
  const tenant = await assertTenantLimit(req, "items");
  const document = await DocumentFile.create({
    title: req.body.title ?? req.file.originalname,
    tenant,
    fileUrl: `/uploads/${req.file.filename}`,
    fileType: req.file.mimetype,
    size: req.file.size,
    client: req.body.client,
    uploadedBy: req.user!.id
  });
  res.status(StatusCodes.CREATED).json({ success: true, document });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await DocumentFile.findOneAndDelete({ _id: req.params.id, ...tenantFilter(req) });
  if (!document) throw new ApiError(StatusCodes.NOT_FOUND, "Document introuvable");
  res.json({ success: true });
});
