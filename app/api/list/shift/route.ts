
// pages/api/shifts/route.ts
import { NextResponse } from 'next/server';
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import connectDB from "@/utility/db/mongoDB/connection";

export async function GET() {
    try {
      await connectDB();
      const shifts = await ShiftModel.find().populate("employeeId");
  
      return NextResponse.json({
        status: 200,
        shifts,
      });
    } catch (error: unknown) {
      console.error("Get Shifts API Error ::", error);
      return NextResponse.json({
        status: 500,
        error: error instanceof Error ? error.message : "Failed to fetch shifts.",
      });
    }
  }
  