/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse,NextRequest } from 'next/server';
import employeedb from "../../../../utility/db/mongoDB/schema/userSchema"; // Adjust this import path to your employee schema
import LeaveRequestModel from "@/utility/db/mongoDB/schema/leaveRequestSchema";
import connectDB from "@/utility/db/mongoDB/connection";
import { getDataFromToken } from '@/helper/getDataFromToken';



export async function POST(request: NextRequest) {

  try {
    await connectDB();

    const userId = await getDataFromToken(request);
    let user:any = await employeedb.findOne({_id:userId})

    
    let leaveRequests;

    const { employee_id } = await request.json();

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

    if (user?.role == "admin" || user?.role == "hr") {
       if (employee_id == "all") {
        
         leaveRequests = await LeaveRequestModel.find().populate("employeeId");
        }else{
         leaveRequests = await LeaveRequestModel.find({employeeId:employee_id}).populate("employeeId");
       }
    }else{
      leaveRequests = await LeaveRequestModel.find({employeeId:userId}).populate("employeeId");
    }
    
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
