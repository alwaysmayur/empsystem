import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import ShiftOfferModel from "@/utility/db/mongoDB/schema/shiftOfferDocument";
import { getDataFromToken } from "@/helper/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getDataFromToken(request); // Validate and get user ID
    const { shiftId } = await request.json(); // Extract shiftId from request body

    // Fetch the shift to ensure it belongs to the logged-in user
    const shift = await ShiftModel.findById(shiftId);
    await ShiftModel.updateOne({_id:shiftId},{isOffered:true});
    if (!shift || shift.employeeId.toString() !== userId) {
      return NextResponse.json({ status: 403, error: "Unauthorized or invalid shift" });
    }

    // Check if a valid shift offer already exists
    const existingOffer = await ShiftOfferModel.findOne({ shiftId, status: "open" });
    if (existingOffer) {
      return NextResponse.json({ status: 400, error: "Shift already offered" });
    }

    // Create a new shift offer
    const offer = await ShiftOfferModel.create({
      shiftId,
      ownerId: userId,
    });

    return NextResponse.json({ status: 201, message: "Shift offer created successfully", offer });
  } catch (error) {
    console.error("Create Offer API Error:", error);
    return NextResponse.json({ status: 500, error: "Internal Server Error" });
  }
}
