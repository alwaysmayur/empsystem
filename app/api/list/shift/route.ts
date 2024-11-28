import { NextResponse, NextRequest } from "next/server";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import connectDB from "@/utility/db/mongoDB/connection";
import { getDataFromToken } from "@/helper/getDataFromToken";
import employeedb from "@/utility/db/mongoDB/schema/userSchema";
import { Employee } from "@/type/Employee";
import moment from "moment";
import SwapRequestModel from "@/utility/db/mongoDB/schema/swapRequestSchema";
import UserModel from "@/utility/db/mongoDB/schema/userSchema";
import dayjs from "dayjs";
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

    // Parse the request body to get the startDate, employeeId, role, and swap flag
    const { startDate, employeeId, role, swap } = await request.json();
    let dateFilter: any = {};
    let shifts: any;
    let shiftIds: any[] = [];
    const currentDate = moment().startOf("day").toDate(); // Start of the current day

    if (swap) {
      // Fetch shifts excluding those of the logged-in user and completed or canceled shifts
      shifts = await ShiftModel.find({
        shiftDate: { $gte: currentDate },
        employeeId: { $ne: userId },
        status: { $nin: ["complete", "cancel"] },
        ...dateFilter,
      })
        .populate("employeeId")
        .sort({ shiftDate: 1 });

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
              swapRequest.requesterShiftId.toString() ===
                shift._id.toString() ||
              swapRequest.requestedShiftId.toString() === shift._id.toString()
          );

          const swapRequestsWithUser = await Promise.all(
            relatedSwapRequests.map(async (swapRequest: any) => {
              const userData = await UserModel.findById(
                swapRequest.requesterId
              );
              return {
                ...swapRequest.toObject(),
                user: userData?.name || "Unknown User",
                shiftDate: moment(
                  swapRequest.requesterShiftId.shiftDate
                ).format("YYYY-MM-DD"),
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
      const weekEnd = moment().endOf("week").toDate();

      if (startDate && !moment(startDate).isSame(currentDate, "day")) {
        dateFilter.shiftDate = moment(startDate).format("YYYY-MM-DD");
      } else {
        dateFilter.shiftDate = { $gte: currentDate, $lte: weekEnd };
      }

      if (user.role === "hr" || user.role === "admin") {
        if (employeeId && employeeId !== "all") {
          dateFilter.employeeId = employeeId;
        }

        if (role !== "all") {
          const employeesWithRole = await UserModel.find(
            { jobRole: role },
            "_id"
          );
          const employeeIds = employeesWithRole.map((e) => e._id);
          dateFilter.employeeId = { $in: employeeIds };
        }

        shifts = await ShiftModel.find(dateFilter)
          .populate("employeeId")
          .sort({ shiftDate: 1 });
      } else {
        dateFilter.employeeId = userId;
        shifts = await ShiftModel.find(dateFilter)
          .populate("employeeId")
          .sort({ shiftDate: 1 });
      }

      shiftIds = shifts.map((shift: any) => shift._id);

      const swapRequests = await SwapRequestModel.find({
        $or: [
          { requesterShiftId: { $in: shiftIds } },
          { requestedShiftId: { $in: shiftIds } },
        ],
      });

      shifts = await Promise.all(
        shifts.map(async (shift: any) => {
          const relatedSwapRequests = swapRequests.filter(
            (swapRequest: any) =>
              swapRequest.requesterShiftId.toString() ===
                shift._id.toString() ||
              swapRequest.requestedShiftId.toString() === shift._id.toString()
          );

          const swapRequestsWithUser = await Promise.all(
            relatedSwapRequests.map(async (swapRequest: any) => {
              const userData = await UserModel.findById(
                swapRequest.requesterId
              );
              const getShiftData = await ShiftModel.findById(
                swapRequest.requesterShiftId.toString()
              );
              return {
                ...swapRequest.toObject(),
                startTime: getShiftData?.startTime,
                endTime: getShiftData?.endTime,
                user: userData?.name || "Unknown User",
                shiftDate: moment(
                  swapRequest.requesterShiftId.shiftDate
                ).format("YYYY-MM-DD"),
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

    // Extract all unique dates from shifts and mark them as available
    const shiftDates = Array.from(
      new Set(shifts.map((shift: any) => shift.shiftDate))
    );

    // Get the start (Monday) and end (Sunday) of the current week
    // Start from the current date and end on the closest Friday
    const startOfWeek = dayjs();
    const endOfWeek = dayjs().endOf("week").subtract(1, "day"); // Adjust to Friday

    // Generate all dates of the current week excluding Saturday and Sunday
    const currentWeekDates = [];
    for (
      let date = startOfWeek;
      date.isBefore(endOfWeek) || date.isSame(endOfWeek);
      date = date.add(1, "day")
    ) {
      // Exclude Saturday (6) and Sunday (0)
      if (![6, 0].includes(date.day())) {
        currentWeekDates.push(date.format("YYYY-MM-DD"));
      }
    }

    // Map currentWeekDates to include availability
    const dates = currentWeekDates.map((date) => ({
      date,
      available: shiftDates.some(
        (shiftDate) =>
          moment(shiftDate).isSame(moment(date, "YYYY-MM-DD"), "day") // Compare dates using Moment.js
      ),
    }));
    // Return shifts along with the dates array
    return NextResponse.json({
      status: 200,
      shifts,
      dates,
    });
  } catch (error: unknown) {
    console.error("Get Shifts API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch shifts.",
    });
  }
}
