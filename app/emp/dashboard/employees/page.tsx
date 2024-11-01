// app/employees/page.tsx
"use client";

import { useEffect, useState } from "react";
import { EmployeeTable } from "@/components/auth/employeetable";
import { Button } from "@/components/ui/button";
import EmployeeForm from "@/components/auth/employeeForm"; // Ensure this uses default import
import { Employee } from "@/type/Employee"; // Your Employee type
import { getToken } from "next-auth/jwt"; // Get token function

import {BadgePlus} from "lucide-react"; // Icons

const EmployeeListPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false); // State to control the popup form
  const [newEmployee, setNewEmployee] = useState(false); // State to control the popup form
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null); // State to track which employee is being edited

  const fetchEmployees = async () => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    }); // Pass request context

    const res = await fetch("/api/list/employee", {
      headers: {
        Authorization: `Bearer ${token}`, // Include token in the header
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch employees", await res.text());
      return;
    }

    const data = await res.json();
    setEmployees(data.employees);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id: string) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });
    await fetch(`/api/delete/employee/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchEmployees(); // Refresh the employee list
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEmployee(null); // Clear the editing state when form closes
    fetchEmployees(); // Refresh the employee list after the form is closed
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false); // Track dialog state

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee); // Set the employee to be edited
    setIsDialogOpen(true); // Open the dialog when edit is clicked
  };

  const handleDialogClose = () => {
    setEditingEmployee(null); // Clear the employee after the dialog closes
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <div className="p-4">
      <Button
        variant="outline"
        className="gap-2 flex justify-center items-center "
        onClick={() => {
          setNewEmployee(true);
          setIsDialogOpen(true);
        }}
      >
        <span>Add</span> <BadgePlus className="w-5 h-5" />
      </Button>
      {/* Render the dialog conditionally if an employee is being edited */}
      {isDialogOpen && newEmployee && (
        <EmployeeForm
          onClose={handleDialogClose}
          refreshEmployees={fetchEmployees}
          editingEmployee={null} // Pass the employee data to the form
          isDialogOpen={isDialogOpen} // Pass isDialogOpen
          setIsDialogOpen={setIsDialogOpen} // Pass setIsDialogOpen
        />
      )}
      <div className="mt-5">
        <EmployeeTable
          data={employees}
          refreshEmployees={fetchEmployees}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default EmployeeListPage;
