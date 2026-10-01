import mongoose, { Schema, type Document, type Model } from "mongoose";

export type PaymentMethod = "cash" | "card" | "transfer" | "cheque";

export interface IPayment extends Document {
  tenant: mongoose.Types.ObjectId;
  invoice: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  reference?: string;
  recordedBy?: mongoose.Types.ObjectId;
}

const paymentSchema = new Schema<IPayment>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: ["cash", "card", "transfer", "cheque"], default: "cash" },
    paidAt: { type: Date, default: Date.now },
    reference: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

paymentSchema.index({ tenant: 1, paidAt: -1 });

export const Payment: Model<IPayment> = mongoose.model<IPayment>("Payment", paymentSchema);
