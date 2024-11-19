// /utility/db/mongoDB/schema/shiftSchema.ts

import mongoose, { Document, Model } from "mongoose";

interface ShiftDocument extends Document {
  employeeId: mongoose.Types.ObjectId;
  shiftDate: Date; // Single shift date
  startTime: string; // New field for start time
  endTime: string;   // New field for end time
  isApproved: boolean;
  status: "scheduled" | "completed" | "canceled";
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new mongoose.Schema<ShiftDocument>({
  employeeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  shiftDate: { type: Date, required: true }, // Single date for the shift
  startTime: { type: String, required: true }, // Start time as string (e.g., "09:00")
  endTime: { type: String, required: true },   // End time as string (e.g., "17:00")
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ["scheduled", "completed", "canceled"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

shiftSchema.pre<ShiftDocument>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ShiftModel: Model<ShiftDocument> = mongoose.models.Shift || mongoose.model("Shift", shiftSchema);

export default ShiftModel;
