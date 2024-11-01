"use client";

import { useEffect, useState } from "react";
import { ShiftTable } from "@/components/dashboard/shifts/shiftTable";
import { Button } from "@/components/ui/button";
import ShiftForm from "@/components/dashboard/shifts/shiftForm";
import { Shift } from "@/type/Shift";
import { Employee } from "@/type/Employee"; // Type for Employee
import { getToken } from "next-auth/jwt";
import { CirclePlus } from "lucide-react";
import { Input } from "@/components/ui/input"; // UI component for date picker

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

const ShiftListPage = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [newShift, setNewShift] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]); // State for employee list
  const [selectedEmployee, setSelectedEmployee] = useState<string>(""); // Employee filter
  const [startDate, setStartDate] = useState<string>(""); // Start date filter
  const [endDate, setEndDate] = useState<string>(""); // End date filter

  const fetchShifts = async () => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const query = new URLSearchParams();
    if (selectedEmployee) query.append("employeeId", selectedEmployee);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const res = await fetch(`/api/list/shift?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("Failed to fetch shifts", await res.text());
      return;
    }

    const data = await res.json();
    setShifts(data.shifts);
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
    fetchShifts();
    fetchEmployees();
  }, [selectedEmployee, startDate, endDate]);

  const handleDelete = async (id: string) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });
    await fetch(`/api/delete/shift/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchShifts();
  };

  const handleFormClose = () => {
    setNewShift(false);
    setEditingShift(null);
    fetchShifts();
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditingShift(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex gap-4 mb-4">
        {/* Date Range Filters */}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start content-center items-center gap-2 text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="w-5 h-5"/>
              {startDate ? format(startDate, "PPP") : <span>Pick Start Date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date:any) => setStartDate(date?.toISOString().split("T")[0])} // Fixed here
              initialFocus
            />
          </PopoverContent>
        </Popover>

      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start gap-2 text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-5 h-5" />
            {endDate ? format(endDate, "PPP") : <span>Pick a End Date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={endDate ? new Date(endDate) : undefined}
            onSelect={(date:any) => setEndDate(date?.toISOString().split("T")[0])} // Fixed here
            initialFocus
          />
        </PopoverContent>
      </Popover>
   

        <Select>
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

        {/* Add Shift Button */}
        <Button
          variant="outline"
          className="gap-2 flex justify-center items-center"
          onClick={() => {
            setNewShift(true);
            setIsDialogOpen(true);
          }}
        >
          <span>Add Shift</span> <CirclePlus className="w-5 h-5" />
        </Button>
      </div>

      {/* Render the dialog for adding or editing shifts */}
      {isDialogOpen && (
        <ShiftForm
          onClose={handleDialogClose}
          refreshShifts={fetchShifts}
          editingShift={newShift ? null : editingShift}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      )}

      {/* Shifts Table */}
      <div className="mt-5">
        <ShiftTable
          data={shifts}
          refreshShifts={fetchShifts}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default ShiftListPage;
