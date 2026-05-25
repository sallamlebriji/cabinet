import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface INotification extends Document {
  tenant?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  user: mongoose.Types.ObjectId;
  read: boolean;
  type: "appointment" | "invoice" | "system";
}

const notificationSchema = new Schema<INotification>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ["appointment", "invoice", "system"], default: "system" }
  },
  { timestamps: true }
);

export const Notification: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema);
