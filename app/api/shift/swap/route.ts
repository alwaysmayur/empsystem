import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import SwapRequestModel from "@/utility/db/mongoDB/schema/swapRequestSchema";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";

export async function POST(req: NextRequest) {
  const { swapRequestId, action } = await req.json();

  // Validate input
  if (!swapRequestId || !["approved", "declined"].includes(action)) {
    return NextResponse.json({
      status: 422,
      error: "Invalid request data.",
    });
  }

  try {
    // Connect to the database
    await connectDB();

    // Fetch the swap request
    const swapRequest = await SwapRequestModel.findById(swapRequestId);

    if (!swapRequest || swapRequest.status !== "pending") {
      return NextResponse.json({
        status: 404,
        error: "Swap request not found or already processed.",
      });
    }

    if (action === "approved") {
      // Fetch the shifts involved in the swap
      const requesterShift = await ShiftModel.findById(
        swapRequest.requesterShiftId
      );
      const requestedShift = await ShiftModel.findById(
        swapRequest.requestedShiftId
      );

      // Swap the employees between the two shifts using updateOne
      await ShiftModel.updateOne(
        { _id: requesterShift._id },
        { $set: { employeeId: requestedShift.employeeId } }
      );

      await ShiftModel.updateOne(
        { _id: requestedShift._id },
        { $set: { employeeId: requesterShift.employeeId } }
      );
    }

    // Update the swap request status to approved or declined
    swapRequest.status = action;
    await swapRequest.save();

    return NextResponse.json({
      status: 200,
      message: `Swap request ${action}.`,
    });
  } catch (error) {
    console.error("Respond Swap Request API Error:", error);
    return NextResponse.json({ status: 500, error: "Server error." });
  }
}
