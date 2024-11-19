"use client";

import { z } from "zod";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shift } from "@/type/Shift"; // Adjust path as necessary
import { Employee } from "@/type/Employee"; // Adjust path as necessary
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { useUser } from "@/app/context/UseContex"; // Assuming you have a user context for current user info

const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;

const ShiftSchema = z
  .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    shiftDate: z.string().min(1, "Shift date is required"),
    startTime: z
      .string()
      .min(1, "Start time is required")
      .regex(timeRegex, "Start time must be in the format hh:mm AM/PM"),
    endTime: z
      .string()
      .min(1, "End time is required")
      .regex(timeRegex, "End time must be in the format hh:mm AM/PM"),
    isApproved: z.boolean().optional(),
    status: z.enum(["scheduled", "completed", "canceled"]).default("scheduled"),
  })
  .refine(
    (data: any) => {
      const shiftDate = new Date(data.shiftDate);
      const [startHour, startMinute, startPeriod] = data.startTime
        .split(/[: ]/)
        .map((v, i) => (i < 2 ? parseInt(v, 10) : v));
      const [endHour, endMinute, endPeriod] = data.endTime
        .split(/[: ]/)
        .map((v, i) => (i < 2 ? parseInt(v, 10) : v));

      const start = new Date(
        shiftDate.getFullYear(),
        shiftDate.getMonth(),
        shiftDate.getDate(),
        (startHour % 12) + (startPeriod === "PM" ? 12 : 0),
        startMinute
      );

      const end = new Date(
        shiftDate.getFullYear(),
        shiftDate.getMonth(),
        shiftDate.getDate(),
        (endHour % 12) + (endPeriod === "PM" ? 12 : 0),
        endMinute
      );

      if (end < start) {
        // Adjust for shifts crossing midnight
        end.setDate(end.getDate() + 1);
      }

      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return diffHours <= 8;
    },
    {
      message: "Shift duration exceeds the limit of 8 hours.",
    }
  );

interface ShiftFormProps {
  onClose: () => void;
  refreshShifts: () => Promise<void>;
  editingShift?: Shift | null;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

const ShiftForm: React.FC<ShiftFormProps> = ({
  onClose,
  refreshShifts,
  editingShift,
  isDialogOpen,
  setIsDialogOpen,
}) => {
  const user: any = useUser(); // Assuming useUser hook gives you the current user with role information

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  const form = useForm<z.infer<typeof ShiftSchema>>({
    resolver: zodResolver(ShiftSchema),
    defaultValues: {
      employeeId: "",
      shiftDate: "",
      startTime: "",
      endTime: "",
      isApproved: false,
      status: "scheduled",
    },
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await fetch("/api/list/employee");
      if (!response.ok) {
        setError("Failed to fetch employees.");
        return;
      }
      const data = await response.json();
      setEmployees(data.employees);
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (editingShift) {
      form.reset({
        employeeId: editingShift.employeeId._id,
        shiftDate: editingShift.shiftDate,
        startTime: editingShift.startTime,
        endTime: editingShift.endTime,
        isApproved: editingShift.isApproved,
        status: editingShift.status,
      });
      console.log("Form Values After Reset:", form.getValues());
    }
  }, [editingShift, form]);

  const onSubmit = async (values: z.infer<typeof ShiftSchema>) => {
    setError("");
    setSuccess("");

    try {
      const method = editingShift ? "PUT" : "POST";
      const url = editingShift
        ? `/api/shifts/${editingShift._id}`
        : "/api/create/shift";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.status !== 200) {
        setError(data.error || "Operation failed.");
      } else {
        setSuccess(
          data.message || (editingShift ? "Shift updated!" : "Shift added!")
        );
        await refreshShifts();
        onClose();
        setIsDialogOpen(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingShift ? "Edit Shift" : "Add Shift"}</DialogTitle>
          <DialogDescription>
            {editingShift
              ? "Modify the shift details."
              : "Fill in the details to create a new shift."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {user?.role !== "employee" && ( // Check user role and hide employee selection for "employee"
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select an employee</option>
                        {employees.map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name || "Unknown Employee"}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="shiftDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift Date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      placeholder="Select shift date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <div className="flex space-x-2">
                    {/* Hour Dropdown */}
                    <FormControl>
                      <select
                        value={
                          field.value
                            .split(":")[0]
                            ?.replace(/AM|PM/, "")
                            .trim() || "12"
                        }
                        className="w-1/3 p-2 border rounded-md"
                        onChange={(e) => {
                          const timeParts = field.value.split(":");
                          const newTime = `${e.target.value}:${
                            timeParts[1] || "00"
                          } ${timeParts[2] || "AM"}`;
                          field.onChange(newTime);
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = i + 1;
                          return (
                            <option
                              key={hour}
                              value={hour < 10 ? `0${hour}` : hour}
                            >
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                    </FormControl>

                    {/* Minute Dropdown */}
                    <FormControl>
                      <select
                        value={field.value.split(":")[1]?.split(" ")[0] || "00"}
                        className="w-1/3 p-2 border rounded-md"
                        onChange={(e) => {
                          const timeParts = field.value.split(":");
                          const newTime = `${timeParts[0] || "12"}:${
                            e.target.value
                          } ${timeParts[2] || "AM"}`;
                          field.onChange(newTime);
                        }}
                      >
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i < 10 ? `0${i}` : i;
                          return (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          );
                        })}
                      </select>
                    </FormControl>

                    {/* AM/PM Dropdown */}
                    <FormControl>
                      <select
                        value={field.value.includes("AM") ? "AM" : "PM"}
                        className="w-1/3 p-2 border rounded-md"
                        onChange={(e) => {
                          const timeParts = field.value.split(":");
                          const newTime = `${timeParts[0] || "12"}:${
                            timeParts[1]?.split(" ")[0] || "00"
                          } ${e.target.value}`;
                          field.onChange(newTime);
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <div className="flex space-x-2">
                    {/* Hour Dropdown */}
                    <FormControl>
                      <select
                        value={
                          field.value
                            .split(":")[0]
                            ?.replace(/AM|PM/, "")
                            .trim() || "12"
                        }
                        className="w-1/3 p-2 border rounded-md"
                        onChange={(e) => {
                          const timeParts = field.value.split(":");
                          const newTime = `${e.target.value}:${
                            timeParts[1] || "00"
                          } ${timeParts[2] || "AM"}`;
                          field.onChange(newTime);
                        }}
                      >
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour = i + 1;
                          return (
                            <option
                              key={hour}
                              value={hour < 10 ? `0${hour}` : hour}
                            >
                              {hour}
                            </option>
                          );
                        })}
                      </select>
                    </FormControl>

                    {/* Minute Dropdown */}
                    <FormControl>
                      <select
                        value={field.value.split(":")[1]?.split(" ")[0] || "00"}
                        className="w-1/3 p-2 border rounded-md"
                        onChange={(e) => {
                          const timeParts = field.value.split(":");
                          const newTime = `${timeParts[0] || "12"}:${
                            e.target.value
                          } ${timeParts[2] || "AM"}`;
                          field.onChange(newTime);
                        }}
                      >
                        {Array.from({ length: 60 }, (_, i) => {
                          const minute = i < 10 ? `0${i}` : i;
                          return (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          );
                        })}
                      </select>
                    </FormControl>

                    {/* AM/PM Dropdown */}
                    <FormControl>
                      <select
                        value={field.value.includes("AM") ? "AM" : "PM"}
                        className="w-1/3 p-2 border rounded-md"
                        onChange={(e) => {
                          const timeParts = field.value.split(":");
                          const newTime = `${timeParts[0] || "12"}:${
                            timeParts[1]?.split(" ")[0] || "00"
                          } ${e.target.value}`;
                          field.onChange(newTime);
                        }}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full p-2 border rounded-md">
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isApproved"
              render={({ field }) =>
                user?.role === "admin" || user?.role === "hr" ? (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          id="isApproved"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Approved</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                ) : null
              }
            />

            <DialogFooter>
              <Button type="submit" variant="outline">
                {editingShift ? "Update Shift" : "Add Shift"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <FormSuccess message={success || ""} />
        <FormError message={error || ""} />
      </DialogContent>
    </Dialog>
  );
};

export default ShiftForm;
