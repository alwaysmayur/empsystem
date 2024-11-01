// pages/api/shifts/[id]/route.ts
import { NextResponse } from 'next/server';
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import connectDB from "@/utility/db/mongoDB/connection";

interface IShiftUpdateRequestBody {
  startDate?: string; // Format: YYYY-MM-DD
  startTime?: string; // Format: HH:mm
  endDate?: string;   // Format: YYYY-MM-DD
  endTime?: string;   // Format: HH:mm
  isApproved?: boolean;
  status?: "scheduled" | "completed" | "canceled";
}

export async function PUT(request: Request, { params }: { params: { shiftId: string } }) {
  const { shiftId } = params;
  const req: IShiftUpdateRequestBody = await request.json();

  try {
    await connectDB();

    // Combine date and time into ISO format strings
    if (req.startDate && req.startTime) {
      req.startDate = new Date(`${req.startDate}T${req.startTime}:00`).toISOString();
    }

    if (req.endDate && req.endTime) {
      req.endDate = new Date(`${req.endDate}T${req.endTime}:00`).toISOString();
    }

    const updatedShift = await ShiftModel.findByIdAndUpdate(shiftId, req, { new: true });

    if (!updatedShift) {
      return NextResponse.json({
        status: 404,
        error: "Shift not found",
      });
    }

    return NextResponse.json({
      status: 200,
      shift: updatedShift,
    });
  } catch (error: unknown) {
    console.error("Update Shift API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
}
