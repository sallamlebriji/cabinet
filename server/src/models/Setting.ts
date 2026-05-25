import { Schema, model, type Document, type Model } from "mongoose";

export interface ISetting extends Document {
  tenant: import("mongoose").Types.ObjectId;
  cabinetName: string;
  slug?: string;
  plan: "trial" | "starter" | "pro" | "enterprise";
  status: "active" | "suspended";
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  openingHours: { day: string; open: string; close: string; closed: boolean }[];
  preferences: Record<string, unknown>;
}

const settingSchema = new Schema<ISetting>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, unique: true },
    cabinetName: { type: String, required: true, default: "Cabinet Professional" },
    slug: { type: String, lowercase: true, trim: true },
    plan: { type: String, enum: ["trial", "starter", "pro", "enterprise"], default: "trial" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    logo: String,
    email: String,
    phone: String,
    address: String,
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
        closed: Boolean
      }
    ],
    preferences: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

settingSchema.index({ slug: 1 }, { unique: true, sparse: true });

export const Setting: Model<ISetting> = model<ISetting>("Setting", settingSchema);
