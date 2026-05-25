import mongoose, { Schema, type Document, type Model } from "mongoose";

export type InvoiceStatus = "paid" | "unpaid" | "partial";

export interface IInvoice extends Document {
  tenant: mongoose.Types.ObjectId;
  cabinet: mongoose.Types.ObjectId;
  number: string;
  client: mongoose.Types.ObjectId;
  items: { label: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate?: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    cabinet: { type: Schema.Types.ObjectId, ref: "Setting" },
    number: { type: String, required: true, unique: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    items: [
      {
        label: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 }
      }
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ["paid", "unpaid", "partial"], default: "unpaid" },
    dueDate: Date
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>("Invoice", invoiceSchema);
