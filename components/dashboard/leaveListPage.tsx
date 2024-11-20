"use client";

import { useEffect, useState } from "react";
import { LeaveTable } from "@/components/dashboard/leaves/leavesTable";
import { Button } from "@/components/ui/button";
import LeaveForm from "@/components/dashboard/leaves/leavesForm";
import { LeaveRequest } from "@/type/LeaveRequest";
import { Employee } from "@/type/Employee"; // Import Employee type
import { getToken } from "next-auth/jwt";
import { CirclePlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LeaveRequestUpdateBody } from "@/type/LeaveRequestUpdateBody";
import { useUser } from "@/app//context/UseContex";

const LeaveListPage = () => {
  const user: any = useUser();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newLeave, setNewLeave] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<LeaveRequestUpdateBody | null>();

  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchLeaves = async () => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });
    const query = new URLSearchParams();
    if (selectedEmployee) query.append("employeeId", selectedEmployee);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const res = await fetch(`/api/list/leave`, {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: JSON.stringify({
        employee_id: selectedEmployee, // Pass the swapRequestId
      }),
    });

    if (!res.ok) {
      console.error("Failed to fetch leaves", await res.text());
      return;
    }

    const data = await res.json();
    setLeaves(data.leaveRequests);
  };

  const fetchEmployees = async () => {
    const res = await fetch("/api/list/employee");
    if (res.ok) {
      const data = await res.json();
      setEmployees(data.employees);
    } else {
      console.error("Failed to fetch employees", await res.text());
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, [selectedEmployee, startDate, endDate]);

  const handleDelete = async (id: string) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });
    await fetch(`/api/delete/leave/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLeaves();
  };

  const handleStatusUpdate = async (id: string, newStatus: "approved" | "rejected" | "pending") => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const res = await fetch(`/api/edit/leave/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      fetchLeaves(); // Refresh the list after status update
    } else {
      console.error("Failed to update leave status", await res.text());
    }
  };

  const handleFormClose = () => {
    setNewLeave(false);
    setEditingLeave(null);
    fetchLeaves();
  };

  const handleEdit = (leave: LeaveRequest) => {
    setEditingLeave(leave);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingLeave(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
         {/* Add Leave Button */}
      <Button
        variant="outline"
        className="gap-2 flex justify-center items-center"
        onClick={() => {
          setNewLeave(true);
          setIsDialogOpen(true);
        }}
      >
        <span>Add Leave</span> <CirclePlus className="w-5 h-5" />
      </Button>
        {/* Employee Filter */}
        <Select onValueChange={(value) => setSelectedEmployee(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Employee" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Employees</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee._id} value={employee._id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

      </div>

      {/* Render the dialog for adding or editing leaves */}
      {isDialogOpen && (
        <LeaveForm
          onClose={handleDialogClose}
          refreshLeaves={fetchLeaves}
          editingLeave={newLeave ? null : editingLeave}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          user={user}
        />
      )}

      <div className="mt-5">
        <LeaveTable
          data={leaves}
          refreshLeaves={fetchLeaves}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onStatusUpdate={handleStatusUpdate} // Pass status update handler
          user={user}
        />
      </div>
    </div>
  );
};

export default LeaveListPage;
