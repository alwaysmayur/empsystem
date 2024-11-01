// /utility/db/mongoDB/schema/shiftSchema.ts

import mongoose, { Document, Model } from "mongoose";

interface ShiftDocument extends Document {
  employeeId: mongoose.Types.ObjectId; // Reference to User
  startDate: Date;
  endDate: Date;
  isApproved: boolean; // Whether the shift has been approved by HR/Admin
  status: "scheduled" | "completed" | "canceled"; // Status of the shift
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new mongoose.Schema<ShiftDocument>({
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
  isApproved: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ["scheduled", "completed", "canceled"],
    default: "scheduled",
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
shiftSchema.pre<ShiftDocument>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ShiftModel: Model<ShiftDocument> = mongoose.models.Shift || mongoose.model("Shift", shiftSchema);

export default ShiftModel;
