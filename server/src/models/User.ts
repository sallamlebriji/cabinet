import bcrypt from "bcryptjs";
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type UserRole = "SUPER_ADMIN" | "ADMIN_TENANT" | "MANAGER" | "EMPLOYEE" | "CLIENT";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  tenant?: mongoose.Types.ObjectId;
  cabinet?: mongoose.Types.ObjectId;
  tokenVersion: number;
  isActive: boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN_TENANT", "MANAGER", "EMPLOYEE", "CLIENT"],
      default: "CLIENT"
    },
    phone: String,
    avatar: String,
    tenant: { type: Schema.Types.ObjectId, ref: "Tenant" },
    cabinet: { type: Schema.Types.ObjectId, ref: "Setting" },
    tokenVersion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
