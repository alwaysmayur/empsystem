// /utility/db/mongoDB/schema/shiftConflictSchema.ts

import mongoose, { Document, Model } from "mongoose";

interface ShiftConflictDocument extends Document {
  shiftId: mongoose.Types.ObjectId; // Reference to the conflicting shift
  reason: string; // Reason for the conflict
  resolved: boolean; // Whether the conflict has been resolved
  resolutionDate?: Date; // Date when the conflict was resolved
}

const shiftConflictSchema = new mongoose.Schema<ShiftConflictDocument>({
  shiftId: {
    type: mongoose.Schema.Types.ObjectId, // Specify type as ObjectId
    ref: "Shift", // Reference to the Shift model
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolutionDate: {
    type: Date,
  },
});

// Create the ShiftConflictModel if it doesn't already exist
const ShiftConflictModel: Model<ShiftConflictDocument> = mongoose.models.ShiftConflict || mongoose.model<ShiftConflictDocument>("ShiftConflict", shiftConflictSchema);

export default ShiftConflictModel;
