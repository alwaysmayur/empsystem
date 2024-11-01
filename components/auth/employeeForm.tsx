/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Employee } from "@/type/Employee"; // Adjust path as necessary
import { FormError } from "@/components/form-error"; // Ensure component exists
import { FormSuccess } from "@/components/form-success"; // Ensure component exists

// Zod schema for employee validation
const EmployeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  role: z.string().min(1, "Role is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  address: z.string().optional(),
});

interface EmployeeFormProps {
  onClose: () => void;
  refreshEmployees: () => Promise<void>;
  editingEmployee?: Employee | null; // Optional prop for editing
  isDialogOpen: boolean; // Control dialog open state
  setIsDialogOpen: (open: boolean) => void; // Function to control dialog open state
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onClose,
  refreshEmployees,
  editingEmployee,
  isDialogOpen,
  setIsDialogOpen,
}) => {
  const [error, setError] = useState<string | undefined>(""); // Error state
  const [success, setSuccess] = useState<string | undefined>(""); // Success state

  const form = useForm<z.infer<typeof EmployeeSchema>>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "", // Password remains empty unless specified
      role: "",
      mobile: "",
      address: "",
    },
  });

  // Automatically populate the form if editingEmployee is passed
  useEffect(() => {
    if (editingEmployee) {
      form.reset({
        name: editingEmployee.name,
        email: editingEmployee.email,
        role: editingEmployee.role,
        mobile: editingEmployee.mobile,
        address: editingEmployee.address || "", // Optional address field
      });
    }
  }, [editingEmployee, form]);

  const onSubmit = async (values: z.infer<typeof EmployeeSchema>) => {
    setError("");
    setSuccess("");

    try {
      const method = editingEmployee ? "PUT" : "POST";
      const url = editingEmployee
        ? `/api/edit/employee/${editingEmployee._id}`
        : "/api/create/employee";

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
        setSuccess(data.message || (editingEmployee ? "Employee updated!" : "Employee added!"));
        await refreshEmployees(); // Refresh employee list
        onClose(); // Close the form after success
        setIsDialogOpen(false); // Close the dialog
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } 
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogDescription>
            {editingEmployee
              ? "Modify the employee's details."
              : "Fill in the employee's details to create a new employee."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter employee's name" />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter employee's email"
                      />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />

              {/* Show password field only if adding a new employee */}
              {!editingEmployee && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter employee's password"
                        />
                      </FormControl>
                      <FormMessage className="font-normal" />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter employee's role" />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter employee's mobile number"
                      />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter employee's address" />
                    </FormControl>
                    <FormMessage className="font-normal" />
                  </FormItem>
                )}
              />
            </div>

            {/* Display success or error messages */}
            <FormSuccess message={success} />
            <FormError message={error} />

            <DialogFooter>
              <Button type="submit" className="w-full">
                {editingEmployee ? "Update Employee" : "Add Employee"}
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

export default EmployeeForm;
