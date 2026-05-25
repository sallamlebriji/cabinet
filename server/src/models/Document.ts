import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IDocument extends Document {
  tenant: mongoose.Types.ObjectId;
  title: string;
  fileUrl: string;
  fileType: string;
  size: number;
  client?: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
}

const documentSchema = new Schema<IDocument>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    size: { type: Number, required: true },
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export const DocumentFile: Model<IDocument> = mongoose.model<IDocument>("Document", documentSchema);
