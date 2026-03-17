import mongoose, { Schema } from "mongoose";

export interface NotificationDoc {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, default: "general" },
    title: { type: String, required: true },
    description: { type: String, required: false, default: "" },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NotificationModel =
  (mongoose.models.Notification as mongoose.Model<NotificationDoc>) ||
  mongoose.model<NotificationDoc>("Notification", NotificationSchema);

