import mongoose, { Schema, model, type Document, type Model } from "mongoose";

export interface IService extends Document {
  tenant: mongoose.Types.ObjectId;
  cabinet: mongoose.Types.ObjectId;
  name: string;
  price: number;
  duration: number;
  description?: string;
  isActive: boolean;
}

const serviceSchema = new Schema<IService>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    cabinet: { type: Schema.Types.ObjectId, ref: "Setting" },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 5 },
    description: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

serviceSchema.index({ tenant: 1, name: 1 });

export const Service: Model<IService> = model<IService>("Service", serviceSchema);
