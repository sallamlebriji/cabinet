import path from "node:path";
import multer from "multer";
import { nanoid } from "nanoid";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${nanoid(8)}${path.extname(file.originalname)}`);
  }
});

const ALLOWED = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx", ".xls", ".xlsx"];

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => cb(null, ALLOWED.includes(path.extname(file.originalname).toLowerCase())),
  limits: { fileSize: 10 * 1024 * 1024 }
});
