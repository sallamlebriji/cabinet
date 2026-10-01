import mongoose, { Schema, type Document, type Model } from "mongoose";

export type QuoteStatus = "draft" | "sent" | "accepted" | "refused";

export interface IQuote extends Document {
  tenant: mongoose.Types.ObjectId;
  number: string;
  client: mongoose.Types.ObjectId;
  items: { label: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: QuoteStatus;
  validUntil?: Date;
  notes?: string;
  invoice?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const quoteSchema = new Schema<IQuote>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
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
    status: { type: String, enum: ["draft", "sent", "accepted", "refused"], default: "draft" },
    validUntil: Date,
    notes: String,
    invoice: { type: Schema.Types.ObjectId, ref: "Invoice" }
  },
  { timestamps: true }
);

quoteSchema.index({ tenant: 1, createdAt: -1 });

export const Quote: Model<IQuote> = mongoose.model<IQuote>("Quote", quoteSchema);
