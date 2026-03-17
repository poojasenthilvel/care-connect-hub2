import mongoose, { Schema } from "mongoose";

export interface TreatmentDoc {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId | null;
  department?: string;
  diagnosis: string;
  medicines: string[];
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  status: "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const TreatmentSchema = new Schema<TreatmentDoc>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null, index: true },
    department: { type: String, required: false, default: "" },
    diagnosis: { type: String, required: true, default: "" },
    medicines: { type: [String], required: true, default: [] },
    startDate: { type: String, required: true },
    endDate: { type: String, required: false, default: "" },
    status: { type: String, required: true, enum: ["ongoing", "completed", "cancelled"], default: "ongoing" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const TreatmentModel =
  (mongoose.models.Treatment as mongoose.Model<TreatmentDoc>) ||
  mongoose.model<TreatmentDoc>("Treatment", TreatmentSchema);

