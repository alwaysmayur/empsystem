"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Employee } from "@/type/Employee"; // Adjust path as necessary
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

const LeaveRequestSchema = z
  .object({
    employeeId: z.string().min(1, "Employee ID is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    leaveType: z.enum(["full-day", "half-day", "hourly"]),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().min(1, "Reason is required"),
  })
  .refine(
    (data) => {
      if (data.leaveType === "half-day" || data.leaveType === "hourly") {
        return data.startTime && data.endTime; // Both startTime and endTime must be provided
      }
      return true; // No validation error
    },
    {
      message:
        "Start time and end time are required for half-day and hourly leave.",
      path: ["startTime", "endTime"], // This will mark both fields as invalid if the condition fails
    }
  );

interface LeaveFormProps {
  onClose: () => void;
  refreshLeaves: () => Promise<void>;
  editingLeave?: any; // Adjust according to your leave type
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  user: any;
}

const LeaveForm: React.FC<LeaveFormProps> = ({
  onClose,
  refreshLeaves,
  editingLeave,
  isDialogOpen,
  setIsDialogOpen,
  user,
}) => {
  const [error, setError] = useState<string | undefined>(""); // Error state
  const [success, setSuccess] = useState<string | undefined>(""); // Success state
  const [employees, setEmployees] = useState<Employee[]>([]); // State for employees

  const form = useForm<z.infer<typeof LeaveRequestSchema>>({
    resolver: zodResolver(LeaveRequestSchema),
    defaultValues: {
      employeeId: user?.role === "admin" || user?.role === "hr" ? "" : user?._id,
      startDate: "",
      endDate: "",
      leaveType: "full-day",
      startTime: "",
      endTime: "",
      reason: "",
    },
  });

  // Fetch employees when the form mounts if user is admin or HR
  useEffect(() => {
    if (user?.role === "admin" || user?.role === "hr") {
      const fetchEmployees = async () => {
        const response = await fetch("/api/list/employee");
        if (!response.ok) {
          setError("Failed to fetch employees.");
          return;
        }
        const data = await response.json();
        setEmployees(data.employees); // Assuming the data structure
      };

      fetchEmployees();
    }
  }, [user]);

  // Populate form with editing leave details if available
  useEffect(() => {
    if (editingLeave) {
      form.reset({
        employeeId: editingLeave.employeeId.toString(),
        startDate: editingLeave.startDate,
        endDate: editingLeave.endDate,
        leaveType: editingLeave.leaveType,
        startTime: editingLeave.startTime,
        endTime: editingLeave.endTime,
        reason: editingLeave.reason,
      });
    }
  }, [editingLeave, form]);

  const onSubmit = async (values: z.infer<typeof LeaveRequestSchema>) => {
    setError("");
    setSuccess("");

    // Validate the form fields
    const result = await form.trigger(); // Trigger validation

    if (!result) {
      setError("Please fix the validation errors before submitting.");
      return; // Exit if validation fails
    }

    try {
      const method = editingLeave ? "PUT" : "POST";
      const url = editingLeave
        ? `/api/edit/leave/${editingLeave._id}` // Update URL according to your routing
        : "/api/create/leave"; // Adjust endpoint for creating leave requests

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Operation failed.");
      } else {
        setSuccess(data.message || (editingLeave ? "Leave updated!" : "Leave request submitted!"));
        await refreshLeaves();
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
          <DialogTitle>
            {editingLeave ? "Edit Leave Request" : "Add Leave Request"}
          </DialogTitle>
          <DialogDescription>
            {editingLeave
              ? "Modify the leave request details."
              : "Fill in the details to create a new leave request."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {user?.role === "admin" || user?.role === "hr" ? (
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
                          {employees.length > 0 ? (
                            employees.map((employee: Employee) => (
                              <option key={employee._id} value={employee._id}>
                                {employee.name || "Unknown Employee"}
                              </option>
                            ))
                          ) : (
                            <option disabled>No employees available</option>
                          )}
                        </select>
                      </FormControl>
                      <FormMessage className="font-normal" />
                    </FormItem>
                  )}
                />
              ) : (
                <input
                  type="hidden"
                  value={user?._id}
                  {...form.register("employeeId")}
                />
              )}

              {/* Remaining fields */}
              <FormField
                control={form.control}
                name="leaveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="full-day">Full Day</option>
                        <option value="half-day">Half Day</option>
                        <option value="hourly">Hourly</option>
                      </select>
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        placeholder="Select start date"
                      />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />

              {form.watch("leaveType") !== "full-day" && (
                <>
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            placeholder="Select start time"
                          />
                        </FormControl>
                        <FormMessage className="font-normal" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            placeholder="Select end time"
                          />
                        </FormControl>
                        <FormMessage className="font-normal" />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        placeholder="Select end date"
                      />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter reason for leave"
                      />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />
            </div>

            {/* Display success or error messages */}
            <FormSuccess message={success || ""} />
            <FormError message={error || ""} />

            <DialogFooter>
              <Button type="submit">
                {editingLeave ? "Update Leave" : "Submit Leave"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveForm;
