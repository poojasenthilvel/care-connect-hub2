import mongoose, { Schema } from "mongoose";

export interface PrescriptionDoc {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  diagnosis: string;
  medicines: any[];
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionSchema = new Schema<PrescriptionDoc>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    diagnosis: { type: String, required: true, default: "" },
    medicines: { type: [Schema.Types.Mixed] as any, required: true, default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PrescriptionModel =
  (mongoose.models.Prescription as mongoose.Model<PrescriptionDoc>) ||
  mongoose.model<PrescriptionDoc>("Prescription", PrescriptionSchema);

