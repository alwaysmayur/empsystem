// /app/api/employees/route.ts
import employeedb from "../../../../utility/db/mongoDB/schema/userSchema"; // Adjust this import path to your employee schema
import connectionMongoDB from "../../../../utility/db/mongoDB/connection";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextResponse, NextRequest } from "next/server";
import LeaveRequestModel from "@/utility/db/mongoDB/schema/leaveRequestSchema";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";

// Create GET Request for retrieving the list of employees
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectionMongoDB();
    // Extract user ID from the authentication token
    const userId = await getDataFromToken(request);

    if (userId) {
      const employee = await employeedb.findOne(
        { _id: userId },
        { role: 1, name: 1, _id: 0, email: 1 }
      );

      const employeeStates = await employeedb.find();

      const shiftsStates = await ShiftModel.find();

      const leavesStates = await LeaveRequestModel.find({ status: "pending" });

      // Return the response with the employees data
      return NextResponse.json({
        status: 200,
        user: {
          employee,
          employeeStates: employeeStates.length,
          shiftsStates: shiftsStates.length,
          leavesStates: leavesStates.length,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Fetch Employees API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: "Internal Server Error",
    });
  }
}
