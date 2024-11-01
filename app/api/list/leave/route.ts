/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from 'next/server';
import LeaveRequestModel from "@/utility/db/mongoDB/schema/leaveRequestSchema";
import connectDB from "@/utility/db/mongoDB/connection";
// import { auth } from "@/auth.config"; // Import your auth utility to get user session

export async function GET(request: Request) {
  // Assuming you have a way to get the user session (e.g., JWT, session cookie)
//   const session = await auth();

//   // Check if the user is authenticated
//   if (!session || !session.user) {
//     return NextResponse.json({
//       status: 401,
//       error: "Unauthorized",
//     });
//   }

//   const userId = session.user._id; // User ID from the session
//   const userRole = session.user.role; // User role from the session

  try {
    await connectDB();

    let leaveRequests;

    // Fetch leave requests based on user role
    // if (userRole === "employee") {
    //   // Fetch only the employee's leave requests
    // //   leaveRequests = await LeaveRequestModel.find({ employeeId: userId });
    //   leaveRequests = await LeaveRequestModel.find();
    // } else if (userRole === "hr" || userRole === "admin") {
    //   // Fetch all leave requests for HR/Admin
    //   leaveRequests = await LeaveRequestModel.find({});
    // } else {
    //   // Handle unauthorized roles
    //   return NextResponse.json({
    //     status: 403,
    //     error: "Forbidden",
    //   });
    // }

    leaveRequests = await LeaveRequestModel.find().populate("employeeId");
    
    return NextResponse.json({
      status: 200,
      leaveRequests,
    });
  } catch (error) {
    console.error("Get Leave Requests API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
}
