import mongoose, { Schema } from "mongoose";

export interface ProfileDoc {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  bloodType?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<ProfileDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    phone: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
    address: { type: String, default: "" },
    bloodType: { type: String, default: "" },
    allergies: { type: String, default: "" },
    emergencyContactName: { type: String, default: "" },
    emergencyContactPhone: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ProfileModel =
  (mongoose.models.Profile as mongoose.Model<ProfileDoc>) || mongoose.model<ProfileDoc>("Profile", ProfileSchema);

