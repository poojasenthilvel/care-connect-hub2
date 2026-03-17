import mongoose, { Schema } from "mongoose";

export interface AppointmentDoc {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId | null;
  department: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  reason?: string;
  type: "in-person" | "telemedicine";
  status: "pending" | "waiting" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<AppointmentDoc>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null, index: true },
    department: { type: String, required: true, default: "" },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, required: false, default: "" },
    type: { type: String, required: true, enum: ["in-person", "telemedicine"], default: "in-person" },
    status: {
      type: String,
      required: true,
      enum: ["pending", "waiting", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ patientId: 1, appointmentDate: 1 });

export const AppointmentModel =
  (mongoose.models.Appointment as mongoose.Model<AppointmentDoc>) ||
  mongoose.model<AppointmentDoc>("Appointment", AppointmentSchema);

