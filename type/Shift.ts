import { Employee } from "./Employee"; // Adjust the path as needed

export interface Shift {
  _id: string;
  employeeId: Employee; // Employee ID (string) or could be an Employee object if populated
  startDate: string; // Store as string, convert to Date in code as needed
  startTime: string; // Store start time as string (HH:mm format)
  endDate: string;
  endTime: string; // Store end time as string (HH:mm format)
  isApproved: boolean;
  status: "scheduled" | "completed" | "canceled";
  createdAt: string;
  updatedAt: string;
}
