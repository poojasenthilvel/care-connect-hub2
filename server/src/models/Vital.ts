import mongoose, { Schema } from "mongoose";

export interface VitalDoc {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  systolic?: number;
  diastolic?: number;
  sugarLevel?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  recordedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const VitalSchema = new Schema<VitalDoc>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    systolic: { type: Number, required: false },
    diastolic: { type: Number, required: false },
    sugarLevel: { type: Number, required: false },
    heartRate: { type: Number, required: false },
    temperature: { type: Number, required: false },
    spo2: { type: Number, required: false },
    recordedAt: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VitalSchema.index({ patientId: 1, recordedAt: 1 });

export const VitalModel =
  (mongoose.models.Vital as mongoose.Model<VitalDoc>) || mongoose.model<VitalDoc>("Vital", VitalSchema);

