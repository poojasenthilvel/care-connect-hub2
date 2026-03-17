import mongoose, { Schema } from "mongoose";

export interface BillDoc {
  _id: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  status: "paid" | "unpaid";
  dueDate?: string;
  paidAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<BillDoc>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, enum: ["paid", "unpaid"], default: "unpaid" },
    dueDate: { type: String, required: false, default: "" },
    paidAt: { type: String, required: false, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const BillModel =
  (mongoose.models.Bill as mongoose.Model<BillDoc>) || mongoose.model<BillDoc>("Bill", BillSchema);

