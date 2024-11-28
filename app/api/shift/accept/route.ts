import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import ShiftOfferModel from "@/utility/db/mongoDB/schema/shiftOfferDocument"; // Adjust the import name
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Validate user and extract `offerId` from the request
    const userId = await getDataFromToken(request);
    const { offerId } = await request.json();

    // Fetch the offer and associated shift
    const offer = await ShiftOfferModel.findOne({ shiftId: offerId }).populate("shiftId");
    if (!offer || offer.status !== "open") {
      return NextResponse.json({ status: 404, error: "Shift offer not found or already closed" });
    }

    // Ensure the user is not the owner of the shift
    if (offer.ownerId.toString() === userId) {
      return NextResponse.json({ status: 400, error: "Cannot accept your own shift offer" });
    }

    // Update the shift's `employeeId` and `isOffered` flag in a single operation
    const shift = await ShiftModel.findByIdAndUpdate(
      offer.shiftId,
      { employeeId: userId, isOffered: false },
      { new: true } // Return the updated document
    );

    if (!shift) {
      return NextResponse.json({ status: 404, error: "Failed to update shift. Shift not found." });
    }

    // Update the offer's status and new employee ID
    offer.status = "accepted";
    offer.newEmployeeId = userId;
    await offer.save();

    return NextResponse.json({
      status: 200,
      message: "Shift offer accepted successfully.",
      shift,
    });
  } catch (error) {
    console.error("Accept Offer API Error:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
}
