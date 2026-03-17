import mongoose, { Schema } from "mongoose";

export interface MedicalReportDoc {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId | null;
  name: string;
  type: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalReportSchema = new Schema<MedicalReportDoc>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null, index: true },
    name: { type: String, required: true },
    type: { type: String, required: true, default: "Lab Report" },
    fileUrl: { type: String, required: false, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MedicalReportModel =
  (mongoose.models.MedicalReport as mongoose.Model<MedicalReportDoc>) ||
  mongoose.model<MedicalReportDoc>("MedicalReport", MedicalReportSchema);

