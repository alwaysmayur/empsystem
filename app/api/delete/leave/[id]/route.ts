// pages/api/leaves/[id]/route.ts
// pages/api/leaves/[id]/route.ts
import { NextResponse } from 'next/server';
import LeaveRequestModel from "@/utility/db/mongoDB/schema/leaveRequestSchema";
import connectDB from "@/utility/db/mongoDB/connection";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
  
    try {
      await connectDB();
  
      const deletedLeaveRequest = await LeaveRequestModel.findByIdAndDelete(id);
  
      if (!deletedLeaveRequest) {
        return NextResponse.json({
          status: 404,
          error: "Leave request not found.",
        });
      }
  
      return NextResponse.json({
        status: 200,
        message: "Leave request deleted successfully.",
      });
    } catch (error: unknown) {
      console.error("Delete Leave Request API Error ::", error);
      return NextResponse.json({
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  }
  