import mongoose, { Schema } from "mongoose";

export type UserRole = "patient" | "doctor" | "admin";

export interface UserDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  specialization?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, required: true, enum: ["patient", "doctor", "admin"] },
    specialization: { type: String, required: false, default: "" },
    avatarUrl: { type: String, required: false, default: "" },
  },
  { timestamps: true }
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc>) || mongoose.model<UserDoc>("User", UserSchema);

