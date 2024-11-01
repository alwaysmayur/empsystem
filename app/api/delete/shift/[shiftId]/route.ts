// pages/api/shifts/route.ts
import { NextResponse } from 'next/server';
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import connectDB from "@/utility/db/mongoDB/connection";

export async function DELETE(_request: Request, { params }: { params: { shiftId: string } }) {
    const { shiftId } = params;
  
    try {
      await connectDB();
      const deletedShift = await ShiftModel.findByIdAndDelete(shiftId);
  
      if (!deletedShift) {
        return NextResponse.json({
          status: 404,
          error: "Shift not found",
        });
      }
  
      return NextResponse.json({
        status: 200,
        message: "Shift deleted successfully",
      });
    } catch (error: unknown) {
      console.error("Delete Shift API Error ::", error);
      return NextResponse.json({
        status: 500,
        error: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    }
  }
  