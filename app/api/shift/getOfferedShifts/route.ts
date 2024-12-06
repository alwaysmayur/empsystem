import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import UserModel from "@/utility/db/mongoDB/schema/userSchema";
import { getDataFromToken } from "@/helper/getDataFromToken"; // Helper to get user ID
import moment from "moment";

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Extract the logged-in user's ID
    const userId = await getDataFromToken(req);

    // Get the logged-in user's data to check their role
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
      });
    }

    const { jobRole, role } = user; // Logged-in user's job role and access level

    const currentDate = moment().startOf("day").toDate(); // Start of the current day

    let shifts;

    if (role === "admin" || role === "hr") {
      // Admin or HR: Fetch all offered shifts for any job role
      shifts = await ShiftModel.find({
        isOffered: true,
        shiftDate: { $gte: currentDate }, // Only future shifts
      }).populate("employeeId"); // Populate employee details
    } else {
      // Regular employees: Fetch only shifts with matching job roles
      shifts = await ShiftModel.find({
        isOffered: true,
        shiftDate: { $gte: currentDate }, // Only future shifts
        employeeId: { $ne: userId }, // Exclude shifts belonging to the logged-in user
      })
        .populate("employeeId") // Populate employee details
        .then((shifts) =>
          shifts.filter((shift) => shift.employeeId.jobRole === jobRole)
        ); // Ensure job roles match
    }

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
