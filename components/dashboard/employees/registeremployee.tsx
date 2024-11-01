"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Ensure the button is imported correctly
import { Input } from "@/components/ui/input"; // Ensure the input is imported correctly
import { Employee } from "@/type/Employee"; // Import your Employee type

export const EmployeeCRUD = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData) {
      await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      fetchEmployees(); // Refresh the employee list
      setFormData(null); // Reset form
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Add Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          placeholder="Name"
          value={formData?.name || ""}
          onChange={handleInputChange}
          required
        />
        <Input
          name="email"
          placeholder="Email"
          type="email"
          value={formData?.email || ""}
          onChange={handleInputChange}
          required
        />
        <Input
          name="password"
          placeholder="Password"
          type="password"
          value={formData?.password || ""}
          onChange={handleInputChange}
          required
        />
        <Input
          name="role"
          placeholder="Role (e.g., admin, HR, employee)"
          value={formData?.role || ""}
          onChange={handleInputChange}
          required
        />
        <Input
          name="mobile"
          placeholder="Mobile"
          type="tel"
          value={formData?.mobile || ""}
          onChange={handleInputChange}
          required
        />
        <Input
          name="address"
          placeholder="Address"
          value={formData?.address || ""}
          onChange={handleInputChange}
          required
        />
        <Button type="submit" className="w-full">
          Add Employee
        </Button>
      </form>
    </div>
  );
};
