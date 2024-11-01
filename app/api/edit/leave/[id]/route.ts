// pages/api/leaves/[id]/route.ts
import { NextResponse } from 'next/server';
import LeaveRequestModel from "@/utility/db/mongoDB/schema/leaveRequestSchema";
import connectDB from "@/utility/db/mongoDB/connection";
import {LeaveRequestUpdateBody} from "@/type/LeaveRequestUpdateBody";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const req: LeaveRequestUpdateBody = await request.json();

  try {
    await connectDB();

    // Update status if a valid status is provided
    if (req.status) {
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(req.status)) {
        return NextResponse.json({
          status: 400,
          error: "Invalid status value provided.",
        });
      }

      const updatedLeaveRequest = await LeaveRequestModel.findByIdAndUpdate(
        id,
        { status: req.status },
        { new: true }
      );

      if (!updatedLeaveRequest) {
        return NextResponse.json({
          status: 404,
          error: "Leave request not found.",
        });
      }

      return NextResponse.json({
        status: 200,
        leaveRequest: updatedLeaveRequest,
        message: `Leave request status updated to ${req.status}.`,
      });
    }

    // If neither cancel nor status is provided, respond with an error
    return NextResponse.json({
      status: 400,
      error: "No valid parameters provided for update.",
    });
  } catch (error: unknown) {
    console.error("Update Leave Request API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
}
