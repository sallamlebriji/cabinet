import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IClient extends Document {
  tenant: mongoose.Types.ObjectId;
  cabinet: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: Date;
  notes?: string;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
}

const clientSchema = new Schema<IClient>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    cabinet: { type: Schema.Types.ObjectId, ref: "Setting" },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    address: String,
    birthDate: Date,
    notes: String,
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

clientSchema.index({ tenant: 1, createdAt: -1 });
clientSchema.index({ firstName: "text", lastName: "text", email: "text", phone: "text" });

export const Client: Model<IClient> = mongoose.model<IClient>("Client", clientSchema);
