import { Schema, model, type Document, type Model } from "mongoose";

export type TenantPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";

export interface ITenant extends Document {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  primaryColor: string;
  isActive: boolean;
  plan: TenantPlan;
  modules: Record<string, boolean>;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    address: String,
    logo: String,
    primaryColor: { type: String, default: "#2563eb" },
    isActive: { type: Boolean, default: true },
    plan: { type: String, enum: ["FREE", "STARTER", "PRO", "ENTERPRISE"], default: "FREE" },
    modules: {
      type: Map,
      of: Boolean,
      default: {
        dashboard: true,
        users: true,
        customers: true,
        appointments: true,
        billing: true,
        reports: true,
        settings: true
      }
    }
  },
  { timestamps: true }
);

export const Tenant: Model<ITenant> = model<ITenant>("Tenant", tenantSchema);
