/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust the import based on your structure
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Shadcn table components
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Shadcn Dialog
import EmployeeForm from "@/components/auth/employeeForm"; // Your employee form component

import {FilePenLine ,Trash2} from "lucide-react"; // Icons

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  mobile: string;
  address: string;
}

interface TableProps {
  data: Employee[]; // Define your employee type
  refreshEmployees: () => Promise<void>; // Refresh employees after edit
  onDelete: (id: string) => void; // Callback for deleting an employee
}

export const EmployeeTable: React.FC<TableProps> = ({
  data,
  refreshEmployees,
  onDelete,
}) => {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null); // Track the employee being edited
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((employee) => (
            <TableRow key={employee._id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>{employee.mobile}</TableCell>
              <TableCell>{employee.address}</TableCell>
              <TableCell>
                {/* Directly trigger the dialog on Edit click */}
                <Button  variant="ghost" className="rounded-full py-0.5 px-2   bg-gray-900"onClick={() => handleEdit(employee)}><FilePenLine className="w-5 h-5"/></Button>
                <Button
                  variant={"destructive"}
                  className="rounded-full py-0.5 px-2 bg-gray-900"
                  onClick={() => onDelete(employee._id)}
                >
                  <Trash2 className="w-5 h-5"/>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Render the dialog conditionally if an employee is being edited */}
      {isDialogOpen && editingEmployee && (
        <EmployeeForm
          onClose={handleDialogClose}
          refreshEmployees={refreshEmployees}
          editingEmployee={editingEmployee} // Pass the employee data to the form
          isDialogOpen={isDialogOpen} // Pass isDialogOpen
          setIsDialogOpen={setIsDialogOpen} // Pass setIsDialogOpen
        />
      )}
    </>
  );
};
