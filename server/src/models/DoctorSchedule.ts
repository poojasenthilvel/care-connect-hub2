import mongoose, { Schema } from "mongoose";

export interface DoctorScheduleDoc {
  _id: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  dayOfWeek: string;
  timeSlots: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorScheduleSchema = new Schema<DoctorScheduleDoc>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dayOfWeek: { type: String, required: true },
    timeSlots: { type: [String], required: true, default: [] },
  },
  { timestamps: true }
);

DoctorScheduleSchema.index({ doctorId: 1, dayOfWeek: 1 }, { unique: true });

export const DoctorScheduleModel =
  (mongoose.models.DoctorSchedule as mongoose.Model<DoctorScheduleDoc>) ||
  mongoose.model<DoctorScheduleDoc>("DoctorSchedule", DoctorScheduleSchema);

