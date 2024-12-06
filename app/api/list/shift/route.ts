import { NextResponse, NextRequest } from "next/server";
import ShiftModel from "@/utility/db/mongoDB/schema/shiftSchema";
import connectDB from "@/utility/db/mongoDB/connection";
import { getDataFromToken } from "@/helper/getDataFromToken";
import employeedb from "@/utility/db/mongoDB/schema/userSchema";
import { Employee } from "@/type/Employee";
import SwapRequestModel from "@/utility/db/mongoDB/schema/swapRequestSchema";
import UserModel from "@/utility/db/mongoDB/schema/userSchema";

import moment from "moment-timezone";
import dayjs from "dayjs";
import utc from "dayjs-plugin-utc";
import timezone from "dayjs-timezone-iana-plugin";

// Initialize plugins for Day.js
dayjs.extend(utc);
dayjs.extend(timezone);

const CANADA_TIMEZONE = "America/Toronto";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getDataFromToken(request);
    const user: Employee | null = await employeedb.findById(userId);
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
      });
    }

    const { startDate, employeeId, role, swap } = await request.json();
    let dateFilter: any = {};
    let shifts: any;
    let shiftIds: any[] = [];

    // Get current date in Canada timezone
    const currentDate = moment().tz(CANADA_TIMEZONE).startOf("day").toDate();

    if (swap) {
      const userJobRole = user.jobRole;
      const employeesWithMatchingRole = await UserModel.find(
        { jobRole: userJobRole },
        "_id"
      );
      const employeeIdsWithRole = employeesWithMatchingRole.map((e) => e._id);

      shifts = await ShiftModel.find({
        shiftDate: { $gte: currentDate },
        employeeId: { $ne: userId, $in: employeeIdsWithRole },
        status: { $nin: ["complete", "cancel"] },
        ...dateFilter,
      })
        .populate("employeeId")
        .sort({ shiftDate: 1 });

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
              swapRequest.requesterShiftId.toString() === shift._id.toString() ||
              swapRequest.requestedShiftId.toString() === shift._id.toString()
          );

          const swapRequestsWithUser = await Promise.all(
            relatedSwapRequests.map(async (swapRequest: any) => {
              const userData = await UserModel.findById(swapRequest.requesterId);
              return {
                ...swapRequest.toObject(),
                user: userData?.name || "Unknown User",
                shiftDate: moment(swapRequest.requesterShiftId.shiftDate)
                  .tz(CANADA_TIMEZONE)
                  .format("YYYY-MM-DD"),
              };
            })
          );

          return {
            ...shift.toObject(),
            totalHours: calculateTotalHours(
              shift.startTime,
              shift.endTime
            ),
            swapRequests: swapRequestsWithUser,
          };
        })
      );
    } else {
      const weekEnd = moment().tz(CANADA_TIMEZONE).endOf("week").toDate();

      // if (startDate && !moment(startDate).isSame(currentDate, "day")) {
      //   dateFilter.shiftDate = moment(startDate)
      //     .tz(CANADA_TIMEZONE)
      //     .format("YYYY-MM-DD");
      // } else {
      //   dateFilter.shiftDate = { $gte: currentDate, $lte: weekEnd };
      // }

      const startOfWeek = moment(startDate || undefined)
      .tz(CANADA_TIMEZONE)
      .startOf("week")
      .toDate();

    const endOfWeek = moment(startDate || undefined)
      .tz(CANADA_TIMEZONE)
      .endOf("week")
      .toDate();
      dateFilter.shiftDate = { $gte: startOfWeek, $lte: endOfWeek };

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
              const userData = await UserModel.findById(swapRequest.requesterId);
              const getShiftData = await ShiftModel.findById(
                swapRequest.requesterShiftId.toString()
              );
              return {
                ...swapRequest.toObject(),
                startTime: getShiftData?.startTime,
                endTime: getShiftData?.endTime,
                user: userData?.name || "Unknown User",
                shiftDate: moment(swapRequest.requesterShiftId.shiftDate)
                  .tz(CANADA_TIMEZONE)
                  .format("YYYY-MM-DD"),
              };
            })
          );

          return {
            ...shift.toObject(),
            totalHours: calculateTotalHours(
              shift.startTime,
              shift.endTime
            ),
            swapRequests: swapRequestsWithUser,
          };
        })
      );
    }

    const totalHours = shifts.reduce(
      (sum: number, shift: any) => sum + (shift.totalHours || 0),
      0
    );

    const shiftDates = Array.from(
      new Set(shifts.map((shift: any) => shift.shiftDate))
    );

    const startOfWeek = dayjs().tz(CANADA_TIMEZONE).startOf("week");
    const endOfWeek = startOfWeek.add(6, "day");

    const currentWeekDates = [];
    for (
      let date = startOfWeek;
      date.isBefore(endOfWeek) || date.isSame(endOfWeek);
      date = date.add(1, "day")
    ) {
      currentWeekDates.push(date.format("YYYY-MM-DD"));
    }

    const dates = currentWeekDates.map((date) => ({
      date,
      available: shiftDates.some(
        (shiftDate) =>
          moment(shiftDate).isSame(moment(date, "YYYY-MM-DD"), "day")
      ),
    }));

    return NextResponse.json({
      status: 200,
      shifts,
      dates,
      totalHours,
    });
  } catch (error: unknown) {
    console.error("Get Shifts API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch shifts.",
    });
  }
}

function calculateTotalHours(startTime: string, endTime: string): number {
  const start = moment(startTime, "HH:mm");
  const end = moment(endTime, "HH:mm");
  const duration = moment.duration(end.diff(start));
  return duration.asHours();
}
