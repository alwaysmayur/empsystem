// pages/api/leaves/route.ts
import { NextResponse } from 'next/server';
import LeaveRequestModel from "@/utility/db/mongoDB/schema/leaveRequestSchema";
import connectDB from "@/utility/db/mongoDB/connection";

interface LeaveRequestBody {
  employeeId: string;
  startDate: string;
  endDate: string;
  leaveType: "full-day" | "half-day" | "hourly";
  startTime?: string;
  endTime?: string;
  reason: string;
}

export async function POST(request: Request) {
  const req: LeaveRequestBody = await request.json();
  const { employeeId, startDate, endDate, leaveType, startTime, endTime, reason } = req;

  if (!employeeId || !startDate || !endDate || !leaveType || !reason) {
    return NextResponse.json({
      status: 422,
      error: "Please fill up all required details.",
    });
  }

  if (leaveType === "half-day" && !startTime) {
    return NextResponse.json({
      status: 422,
      error: "Start time is required for half-day leave.",
    });
  }

  if (leaveType === "hourly" && (!startTime || !endTime)) {
    return NextResponse.json({
      status: 422,
      error: "Both start and end times are required for hourly leave.",
    });
  }

  try {
    await connectDB();

    const newLeaveRequest = new LeaveRequestModel({
      employeeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      leaveType,
      startTime,
      endTime,
      reason,
    });

    const savedLeaveRequest = await newLeaveRequest.save();

    return NextResponse.json({
      status: 201,
      leaveRequest: savedLeaveRequest,
    });
  } catch (error: unknown) {
    console.error("Create Leave Request API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
}
