import mongoose, { Schema, type Document, type Model } from "mongoose";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface IAppointment extends Document {
  tenant: mongoose.Types.ObjectId;
  cabinet: mongoose.Types.ObjectId;
  client: mongoose.Types.ObjectId;
  employee?: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
  notes?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    cabinet: { type: Schema.Types.ObjectId, ref: "Setting" },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    employee: { type: Schema.Types.ObjectId, ref: "User" },
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending"
    },
    notes: String
  },
  { timestamps: true }
);

appointmentSchema.index({ tenant: 1, startAt: 1, status: 1 });

export const Appointment: Model<IAppointment> = mongoose.model<IAppointment>("Appointment", appointmentSchema);
