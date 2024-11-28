import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import UserModel from "@/utility/db/mongoDB/schema/userSchema";
import { getDataFromToken } from "@/helper/getDataFromToken"; // Import helper to get user ID
import moment from "moment";

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Extract the logged-in user's ID
    const userId = await getDataFromToken(req);

    // Get the logged-in user's data to check their job role
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
      });
    }

    const userJobRole = user.jobRole; // Logged-in user's job role

    const currentDate = moment().startOf("day").toDate(); // Start of the current day

    // Fetch shifts with `isOffered: true`, exclude the user's shifts, and ensure job roles match
    const shifts = await ShiftModel.find({
      isOffered: true,
      shiftDate: { $gte: currentDate }, // Only future shifts
      employeeId: { $ne: userId }, // Exclude shifts belonging to the logged-in user
    }).populate("employeeId") // Populate employee details
      .then((shifts) =>
        shifts.filter((shift) => shift.employeeId.jobRole === userJobRole)
      ); // Ensure job roles match

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
