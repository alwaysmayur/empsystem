// /utility/db/mongoDB/schema/leaveRequestSchema.ts

import mongoose, { Document, Model } from "mongoose";

interface LeaveRequestDocument extends Document {
  employeeId: mongoose.Types.ObjectId; // Reference to User
  startDate: Date; // Start date of the leave
  endDate: Date; // End date of the leave
  leaveType: "full-day" | "half-day" | "hourly"; // Type of leave
  startTime?: string; // Start time for half-day or hourly leaves
  endTime?: string; // End time for half-day or hourly leaves
  reason: string; // Reason for the leave
  status: "pending" | "approved" | "rejected"; // Approval status
  createdAt: Date; // When the request was created
  updatedAt: Date; // When the request was last updated
}

const leaveRequestSchema = new mongoose.Schema<LeaveRequestDocument>({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to User model
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  leaveType: {
    type: String,
    enum: ["full-day", "half-day", "hourly"],
    required: true,
  },
  startTime: {
    type: String,
    required: function (this: LeaveRequestDocument) {
      return this.leaveType !== "full-day"; // Only required for half-day or hourly leave
    },
  },
  endTime: {
    type: String,
    required: function (this: LeaveRequestDocument) {
      return this.leaveType === "hourly"; // Only required for hourly leave
    },
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
leaveRequestSchema.pre<LeaveRequestDocument>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const LeaveRequestModel: Model<LeaveRequestDocument> =
  mongoose.models.LeaveRequest || mongoose.model("LeaveRequest", leaveRequestSchema);

export default LeaveRequestModel;
