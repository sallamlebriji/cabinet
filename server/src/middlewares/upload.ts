import path from "node:path";
import multer from "multer";
import { nanoid } from "nanoid";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${nanoid(8)}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
