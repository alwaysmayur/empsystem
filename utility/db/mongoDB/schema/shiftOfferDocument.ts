// /utility/db/mongoDB/schema/shiftOfferSchema.ts
import mongoose, { Document, Model } from "mongoose";

interface ShiftOfferDocument extends Document {
  shiftId: mongoose.Types.ObjectId; // Reference to the shift being offered
  ownerId: mongoose.Types.ObjectId; // Original owner of the shift
  newEmployeeId?: mongoose.Types.ObjectId; // Employee who accepted the offer
  status: "open" | "accepted" | "closed"; // Status of the offer
  createdAt: Date;
  updatedAt: Date;
}

const shiftOfferSchema = new mongoose.Schema<ShiftOfferDocument>(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    newEmployeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["open", "accepted", "closed"], default: "open" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ShiftOfferModel: Model<ShiftOfferDocument> =
  mongoose.models.ShiftOffer || mongoose.model("ShiftOffer", shiftOfferSchema);

export default ShiftOfferModel;
