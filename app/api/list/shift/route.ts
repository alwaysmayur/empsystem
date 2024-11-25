import { NextResponse, NextRequest } from "next/server";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import connectDB from "@/utility/db/mongoDB/connection";
import { getDataFromToken } from "@/helper/getDataFromToken";
import employeedb from "@/utility/db/mongoDB/schema/userSchema"; // Adjust the import path as necessary
import { Employee } from "@/type/Employee";
import moment from "moment";
import SwapRequestModel from "@/utility/db/mongoDB/schema/swapRequestSchema"; // Import the SwapRequestModel
import UserModel from "@/utility/db/mongoDB/schema/userSchema";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectDB();

    // Extract user ID from the authentication token
    const userId = await getDataFromToken(request);

    // Fetch user to check the role
    const user: Employee | null = await employeedb.findById(userId);
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
      });
    }

    // Parse the request body to get the startDate, employeeId, and swap flag
    const { startDate, employeeId, role,swap } = await request.json();
    // Build the date filter based on startDate if provided
    let dateFilter: any = {};
    if (startDate) {
      dateFilter.shiftDate = moment(startDate).format("YYYY-MM-DD");
    }

    let shifts: any;
    let shiftIds: any[] = [];

    if (swap) {
      const currentDate = moment().startOf("day").toDate();
      // For swap, exclude shifts where the logged-in user is the employee and exclude "complete" or "cancel" statuses
      shifts = await ShiftModel.find({
        ...dateFilter,
        shiftDate: { $gte: currentDate }, // Filter shifts with shiftDate >= current date
        employeeId: { $ne: userId }, // Exclude shifts with the logged-in user's ID
        status: { $nin: ["complete", "cancel"] }, // Exclude "complete" and "cancel" statuses
      }).populate("employeeId").sort( { "shiftDate": 1 } );

      // Collect shift IDs to fetch related swap requests
      shiftIds = shifts.map((shift: any) => shift._id);

      // Fetch related swap requests for each shift
      const swapRequests = await SwapRequestModel.find({
        $or: [
          { requesterShiftId: { $in: shiftIds } },
          { requestedShiftId: { $in: shiftIds } },
        ],
      });

      // Add swap request data to each shift
      shifts = await Promise.all(
        shifts.map(async (shift: any) => {
          const relatedSwapRequests = swapRequests.filter(
            (swapRequest: any) =>
              swapRequest.requesterShiftId.toString() ===
                shift._id.toString() ||
              swapRequest.requestedShiftId.toString() === shift._id.toString()
          );

          // Fetch user data for each swap request and add it to the response
          const swapRequestsWithUser = await Promise.all(
            relatedSwapRequests.map(async (swapRequest: any) => {
              const userData = await UserModel.findById(
                swapRequest.requesterId
              );
              return {
                ...swapRequest.toObject(),
                user: userData?.name || "Unknown User", // Add requester name
                shiftDate: moment(
                  swapRequest.requesterShiftId.shiftDate
                ).format("YYYY-MM-DD"), // Add shift date
              };
            })
          );

          return {
            ...shift.toObject(),
            swapRequests: swapRequestsWithUser,
          };
        })
      );
    } else {
      const currentDate = moment().startOf("day").toDate(); // Start of the current day
      const weekEnd = moment().endOf("week").toDate(); // End of the current week

      // Check if `startDate` is provided
      if (startDate && !moment(startDate).isSame(currentDate, "day")) {
        // If startDate is provided, return shifts only for that specific date
        dateFilter.shiftDate = moment(startDate).format("YYYY-MM-DD");
      } else {
        // Default filter: current week shifts and greater than today
        dateFilter.shiftDate = { $gte: currentDate, $lte: weekEnd };
      }

      if (user.role === "hr" || user.role === "admin") {
        // HR/Admin role-specific filtering
        if (employeeId && employeeId !== "all") {
          dateFilter.employeeId = employeeId;
        }

        if (role !== "all") {
          const employeesWithRole = await UserModel.find({ jobRole: role }, "_id"); // Fetch employee IDs with the specified role
          const employeeIds = employeesWithRole.map((e) => e._id); // Extract IDs
        
          dateFilter.employeeId = { $in: employeeIds }; // Filter shifts by these employee IDs
        }

        // Fetch shifts for the selected employee or all employees
        shifts = await ShiftModel.find(dateFilter).populate("employeeId").sort( { "shiftDate": 1 } );
      } else {
        // Non-HR/Admin users can only see their own shifts
        dateFilter.employeeId = userId;
        shifts = await ShiftModel.find(dateFilter).populate("employeeId").sort( { "shiftDate": 1 } );
      }

      // Collect shift IDs to fetch related swap requests
      shiftIds = shifts.map((shift: any) => shift._id);

      // Fetch related swap requests
      const swapRequests = await SwapRequestModel.find({
        $or: [
          { requesterShiftId: { $in: shiftIds } },
          { requestedShiftId: { $in: shiftIds } },
        ],
      });


      // Add swap request data to each shift
      shifts = await Promise.all(
        shifts.map(async (shift: any) => {
          const relatedSwapRequests = swapRequests.filter(
            (swapRequest: any) =>
              swapRequest.requesterShiftId.toString() === shift._id.toString() ||
              swapRequest.requestedShiftId.toString() === shift._id.toString()
          );

          // Fetch user data for each swap request and add it to the response
          const swapRequestsWithUser = await Promise.all(
            relatedSwapRequests.map(async (swapRequest: any) => {
              const userData = await UserModel.findById(
                swapRequest.requesterId
              );
              const getShiftData = await ShiftModel.findById(swapRequest.requesterShiftId.toString());
              return {
                ...swapRequest.toObject(),
                startTime:getShiftData.startTime,
                endTime: getShiftData.endTime,
                user: userData?.name || "Unknown User", // Add requester name
                shiftDate: moment(
                  swapRequest.requesterShiftId.shiftDate
                ).format("YYYY-MM-DD"), // Add shift date
              };
            })
          );

          return {
            ...shift.toObject(),
            swapRequests: swapRequestsWithUser,
          };
        })
      );
    }

    // Return the shifts response with swap requests inside each shift
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
