import mongoose, { Schema } from "mongoose";

export interface AnnouncementDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  message: string;
  createdBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<AnnouncementDoc>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AnnouncementModel =
  (mongoose.models.Announcement as mongoose.Model<AnnouncementDoc>) ||
  mongoose.model<AnnouncementDoc>("Announcement", AnnouncementSchema);

