import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import moment  from "moment";
export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    const currentDate = moment().startOf("day").toDate(); // Start of the current day
    const shifts = await ShiftModel.find({ isOffered: true ,shiftDate : { $gte: currentDate } }).populate("employeeId");

    return NextResponse.json({
      status: 200,
      shifts
    });

  } catch (error) {
    console.error("Respond offere list Request API Error:", error);
    return NextResponse.json({ status: 500, error: "Server error." });
  }
}
