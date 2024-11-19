// // pages/api/shifts/route.ts
// import { NextResponse } from 'next/server';
// import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
// import connectDB from "@/utility/db/mongoDB/connection";

// interface IShiftRequestBody {
//   employeeId: string;
//   startDate: string; // Format: YYYY-MM-DD
//   startTime: string; // Format: HH:mm
//   endDate: string;   // Format: YYYY-MM-DD
//   endTime: string;   // Format: HH:mm
//   isApproved?: boolean;
//   status?: "scheduled" | "completed" | "canceled";
// }

// export async function POST(request: Request) {
//   const req: IShiftRequestBody = await request.json();

//   const {
//     employeeId,
//     startDate,
//     startTime,
//     endDate,
//     endTime,
//     isApproved = false,
//     status = "scheduled"
//   } = req;

//   if (!employeeId || !startDate || !startTime || !endDate || !endTime) {
//     return NextResponse.json({
//       status: 422,
//       error: "Please fill up all required details.",
//     });
//   }

//   try {

//     await connectDB();

//     // Combine the date and time to create a valid Date object
//     const startDateTime = new Date(`${startDate}T${startTime}:00`);
//     const endDateTime = new Date(`${endDate}T${endTime}:00`);

//     const newShift = new ShiftModel({
//       employeeId,
//       startDate: startDateTime,
//       endDate: endDateTime,
//       isApproved,
//       status,
//     });

//     const savedShift = await newShift.save();

//     return NextResponse.json({
//       status: 201,
//       shift: savedShift,
//     });

//   } catch (error: unknown) {
//     console.error("Create Shift API Error ::", error);
//     return NextResponse.json({
//       status: 500,
//       error: error instanceof Error ? error.message : "An unknown error occurred.",
//     });
//   }
// }
// /pages/api/shifts/create.ts

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utility/db/mongoDB/connection";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema"; // Import the Shift model

// API handler for creating a shift
export async function POST(req: NextRequest, res: NextResponse) {
  const { employeeId, shiftDate, role, startTime, endTime } = JSON.parse(
    await req.text()
  );

  // Validate the required fields
  if (!employeeId || !shiftDate || !startTime || !endTime) {
    return NextResponse.json({ status: 422, error: "Missing required fields" });
  }

  try {
    // Connect to the database
    await dbConnect();

    // Create a new shift document
    const newShift = new ShiftModel({
      employeeId,
      shiftDate, // Use the single shiftDate field
      startTime, // New field for start time
      endTime, // New field for end time
      isApproved: false, // Set default value, can be modified later
      status: "scheduled", // Set default value
    });

    // Save the shift to the database
    const savedShift = await newShift.save();

    // Respond with the created shift
    return NextResponse.json({ status: 200, message:"Shift created successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500, error: "Server error" });
  }
}
