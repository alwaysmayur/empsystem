
import { Employee } from "./Employee"; // Adjust the path as needed

export interface LeaveRequest {
  _id:string,
  employeeId: Employee; // Reference to User
  startDate: Date; // Start date of the leave
  endDate: Date; // End date of the leave
  leaveType: "full-day" | "half-day" | "hourly"; // Type of leave
  startTime: string; // Start time for half-day or hourly leaves
  endTime: string; // End time for half-day or hourly leaves
  reason: string; // Reason for the leave
  status: "Pending" | "Approved" | "Rejected"; // Approval status
  createdAt: Date; // When the request was created
  updatedAt: Date; // When the request was last updated
  }
  