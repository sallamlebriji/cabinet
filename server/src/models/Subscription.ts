import mongoose, { Schema, model, type Document, type Model } from "mongoose";

export type SubscriptionPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";

export interface ISubscription extends Document {
  tenant: mongoose.Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  maxUsers: number;
  maxStorage: number;
  maxItems: number;
  enabledModules: string[];
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, unique: true },
    plan: { type: String, enum: ["FREE", "STARTER", "PRO", "ENTERPRISE"], default: "FREE" },
    status: { type: String, enum: ["trial", "active", "past_due", "canceled"], default: "trial" },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    maxUsers: { type: Number, default: 3 },
    maxStorage: { type: Number, default: 512 },
    maxItems: { type: Number, default: 100 },
    enabledModules: {
      type: [String],
      default: ["dashboard", "users", "customers", "appointments", "billing", "reports", "settings"]
    }
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> = model<ISubscription>("Subscription", subscriptionSchema);
