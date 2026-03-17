import mongoose, { Schema } from "mongoose";

export interface DepartmentDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<DepartmentDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const DepartmentModel =
  (mongoose.models.Department as mongoose.Model<DepartmentDoc>) ||
  mongoose.model<DepartmentDoc>("Department", DepartmentSchema);

