"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox"; // Ensure this import is correct
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

// Zod schema for shift validation
const ShiftSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isApproved: z.boolean().optional(),
  status: z.enum(["scheduled", "completed", "canceled"]).default("scheduled"),
});

interface ShiftFormProps {
  onClose: () => void;
  refreshShifts: () => Promise<void>;
  editingShift?: Shift | null; // Optional prop for editing
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
  const [error, setError] = useState<string | undefined>(""); // Error state
  const [success, setSuccess] = useState<string | undefined>(""); // Success state
  const [employees, setEmployees] = useState<Employee[]>([]); // State for employees

  const form = useForm<z.infer<typeof ShiftSchema>>({
    resolver: zodResolver(ShiftSchema),
    defaultValues: {
      employeeId: "",
      startDate: "",
      endDate: "",
      startTime: "", // Add default for startTime
      endTime: "",   // Add default for endTime
      isApproved: false,
      status: "scheduled",
    },
  });

  // Fetch employees when the form mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await fetch("/api/list/employee");
      if (!response.ok) {
        setError("Failed to fetch employees.");
        return;
      }
      const data = await response.json();
      console.log(data);
      
      setEmployees(data.employees); // Assuming the data structure
    };

    fetchEmployees();
  }, []);

  // Populate form with editing shift details if available
  useEffect(() => {
    if (editingShift) {
      form.reset({
        employeeId: editingShift?.employeeId?.toString() ?? "",
        startDate: editingShift.startDate,
        endDate: editingShift.endDate,
        startTime: editingShift.startTime, // Populate startTime
        endTime: editingShift.endTime,       // Populate endTime
        isApproved: editingShift.isApproved,
        status: editingShift.status,
      });
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

      if (!response.ok) {
        setError(data.error || "Operation failed.");
      } else {
        setSuccess(data.message || (editingShift ? "Shift updated!" : "Shift added!"));
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-2 border rounded-md">
                        <option value="">Select an employee</option>
                        {employees.length > 0 ? (
                          employees.map((employee: Employee) => (
                            <option key={employee._id} value={employee._id}>
                              {typeof employee.name === "string" ? employee.name : "Unknown Employee"}
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isApproved"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          id="isApproved" // You can give it a unique ID
                          checked={field.value} // Use field.value for the checked state
                          onCheckedChange={(checked) => field.onChange(checked)} // Update the form state on change
                        />
                      </FormControl>
                      <label
                        htmlFor="isApproved" // Ensure the label is linked to the checkbox
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Approval Status
                      </label>
                    </div>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />
            </div>

            {/* Display success or error messages */}
            <FormSuccess message={success || ""} />
            <FormError message={error || ""} />

            <DialogFooter>
              <Button type="submit" className="w-full">
                {editingShift ? "Update Shift" : "Add Shift"}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftForm;
