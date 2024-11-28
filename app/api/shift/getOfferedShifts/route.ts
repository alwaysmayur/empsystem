import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import { getDataFromToken } from "@/helper/getDataFromToken"; // Import helper to get user ID
import moment from "moment";

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Extract the logged-in user's ID
    const userId = await getDataFromToken(req);

    const currentDate = moment().startOf("day").toDate(); // Start of the current day

    // Fetch shifts with `isOffered: true` and exclude shifts owned by the logged-in user
    const shifts = await ShiftModel.find({
      isOffered: true,
      shiftDate: { $gte: currentDate }, // Only future shifts
      employeeId: { $ne: userId }, // Exclude shifts belonging to the logged-in user
    }).populate("employeeId");

    return NextResponse.json({
      status: 200,
      shifts,
    });
  } catch (error) {
    console.error("Respond Offer List API Error:", error);
    return NextResponse.json({
      status: 500,
      error: "Server error.",
    });
  }
}
