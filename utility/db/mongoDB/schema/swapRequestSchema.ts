// /utility/db/mongoDB/schema/swapRequestSchema.ts

import mongoose, { Document, Model } from "mongoose";

interface SwapRequestDocument extends Document {
  requesterId: mongoose.Types.ObjectId; // Employee A
  requesterShiftId: mongoose.Types.ObjectId; // Employee A's shift
  requestedShiftId: mongoose.Types.ObjectId; // Employee B's shift
  status: "pending" | "approved" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

const swapRequestSchema = new mongoose.Schema<SwapRequestDocument>({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requesterShiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
  requestedShiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
  status: { type: String, enum: ["pending", "approved", "declined"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

swapRequestSchema.pre<SwapRequestDocument>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const SwapRequestModel: Model<SwapRequestDocument> =
  mongoose.models.SwapRequest || mongoose.model("SwapRequest", swapRequestSchema);

export default SwapRequestModel;
