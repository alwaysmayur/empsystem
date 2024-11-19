import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utility/db/mongoDB/connection";
import SwapRequestModel from "@/utility/db/mongoDB/schema/swapRequestSchema";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";  // Import ShiftModel to update shifts
import UserModel from "@/utility/db/mongoDB/schema/userSchema";  // Import UserModel to update users' roles

export async function POST(req: NextRequest) {
  const { requesterId,requestedId, requesterShiftId, requestedShiftId } = await req.json();

  console.log({ requesterId, requesterShiftId, requestedShiftId });

  // Validate input
  if (!requesterId || !requesterShiftId || !requestedShiftId|| !requestedId) {
    return NextResponse.json({ status: 422, error: "Missing required fields." });
  }

  try {
    // Connect to the database
    await connectDB();

    // Fetch the requester and requested users
    const requester = await UserModel.findById(requesterId);
    const requested = await UserModel.findById(requestedId);
    
    if (!requester || !requested) {
      return NextResponse.json({ status: 404, error: "User(s) not found." });
    }

    // Check if both users' roles are compatible for swapping shifts (you can define the rule as per your logic)
    if (requester.jobRole !== requested.jobRole) {
      return NextResponse.json({
        status: 400,
        error: "Users' job roles do not match. Swap cannot proceed.",
      });
    }

    // Fetch the shifts for the requester and requested user
    const requesterShift = await ShiftModel.findById(requesterShiftId);
    const requestedShift = await ShiftModel.findById(requestedShiftId);

    if (!requesterShift || !requestedShift) {
      return NextResponse.json({ status: 404, error: "Shift(s) not found." });
    }

    // // Swap the shifts between the users
    // const tempShift = requesterShift.employeeId;
    // requesterShift.employeeId = requestedShift.employeeId;
    // requestedShift.employeeId = tempShift;

    // // Save the swapped shifts
    // await requesterShift.save();
    // await requestedShift.save();

    // // Swap the job roles between the users (if needed)
    // const tempJobRole = requester.jobRole;
    // requester.jobRole = requested.jobRole;
    // requested.jobRole = tempJobRole;

    // // Save the updated users' job roles
    // await requester.save();
    // await requested.save();

    // Create the swap request
    const swapRequest = new SwapRequestModel({
      requesterId,
      requesterShiftId,
      requestedShiftId,
    });

    const savedRequest = await swapRequest.save();

    return NextResponse.json({
      status: 200,
      message: "Swap request created and shifts swapped successfully.",
      swapRequest: savedRequest,
    });
  } catch (error) {
    console.error("Create Swap Request API Error:", error);
    return NextResponse.json({ status: 500, error: "Server error." });
  }
}
