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
              <CalendarIcon className="w-5 h-5" />
              {startDate ? (
                format(startDate, "PPP")
              ) : (
                <span>Pick Start Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate ? new Date(startDate) : undefined}
              onSelect={(date: any) =>
                setStartDate(date?.toISOString().split("T")[0])
              } // Fixed here
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
              onSelect={(date: any) =>
                setEndDate(date?.toISOString().split("T")[0])
              } // Fixed here
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
        {/* <ShiftTable
          data={shifts}
          refreshShifts={fetchShifts}
          onDelete={handleDelete}
          onEdit={handleEdit}
        /> */}
        <section className="relative bg-gray-100 rounded-xl boarder">
         {/* <div className="bg-sky-400 w-full sm:w-40 h-40 rounded-full absolute top-1 opacity-20 max-sm:right-0 sm:left-56 z-0" />
          <div className="bg-emerald-500 w-full sm:w-40 h-24 absolute top-0 -left-0 opacity-20 z-0" />
          <div className="bg-purple-600 w-full sm:w-40 h-24 absolute top-40 -left-0 opacity-20 z-0" /> */}
          <div className="w-full py-12 relative z-10 backdrop-blur-3xl rounded-xl">
            <div className="w-full max-w-7xl mx-auto px-2 lg:px-8">
              <div className="grid grid-cols-12 gap-8 max-w-4xl mx-auto xl:max-w-full">
                <div className="col-span-12 xl:col-span-5">
                  <h2 className="font-manrope text-3xl leading-tight text-gray-900 mb-1.5">
                    Today's Shifts
                  </h2>
                  <p className="text-lg font-normal text-gray-600 mb-8">
                    Don’t miss schedule
                  </p>
                  <div className="flex gap-5 flex-col">
                    <div className="p-6 rounded-xl bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                          <p className="text-base font-medium text-gray-900">
                            Jan 10,2020 - 10:00 - 11:00
                          </p>
                        </div>
                        <div className="dropdown relative inline-flex">
                          <button
                            type="button"
                            data-target="dropdown-default"
                            className="dropdown-toggle inline-flex justify-center py-2.5 px-1 items-center gap-2 text-sm text-black rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:text-purple-600  "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={12}
                              height={4}
                              viewBox="0 0 12 4"
                              fill="none"
                            >
                              <path
                                d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707"
                                stroke="currentcolor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                          <div
                            id="dropdown-default"
                            className="dropdown-menu rounded-xl shadow-lg bg-white absolute top-full -left-10 w-max mt-2 hidden"
                            aria-labelledby="dropdown-default"
                          >
                            <ul className="py-2">
                              <li>
                                <a
                                  className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                  href="javascript:;"
                                >
                                  Edit
                                </a>
                              </li>
                              <li>
                                <a
                                  className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                  href="javascript:;"
                                >
                                  Remove
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <h6 className="text-xl leading-8 font-semibold text-black mb-1">
                        Mohib's Shift
                      </h6>
                      <p className="text-base font-normal text-gray-600">
                       At Bill Point
                       
                      </p>
                    </div>
                    <div className="p-6 rounded-xl bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                          <p className="text-base font-medium text-gray-900">
                            Jan 10,2020 - 05:40 - 13:00
                          </p>
                        </div>
                        <div className="dropdown relative inline-flex">
                          <button
                            type="button"
                            data-target="dropdown-a"
                            className="dropdown-toggle inline-flex justify-center py-2.5 px-1 items-center gap-2 text-sm text-black rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:text-sky-400  "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={12}
                              height={4}
                              viewBox="0 0 12 4"
                              fill="none"
                            >
                              <path
                                d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707"
                                stroke="currentcolor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                          <div
                            id="dropdown-a"
                            className="dropdown-menu rounded-xl shadow-lg bg-white absolute -left-10 top-full w-max mt-2 hidden"
                            aria-labelledby="dropdown-a"
                          >
                            <ul className="py-2">
                              <li>
                                <a
                                  className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                  href="javascript:;"
                                >
                                  Edit
                                </a>
                              </li>
                              <li>
                                <a
                                  className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                  href="javascript:;"
                                >
                                  Remove
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <h6 className="text-xl leading-8 font-semibold text-black mb-1">
                        Divya's Shift
                      </h6>
                      <p className="text-base font-normal text-gray-600">
                        At Kitchen
                      </p>
                    </div>
                    <div className="p-6 rounded-xl bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          <p className="text-base font-medium text-gray-900">
                            Jan 14, 2020 10:00 - 11:00
                          </p>
                        </div>
                        <div className="dropdown relative inline-flex">
                          <button
                            type="button"
                            data-target="dropdown-b"
                            className="dropdown-toggle inline-flex justify-center py-2.5 px-1 items-center gap-2 text-sm text-black rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:text-emerald-600  "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={12}
                              height={4}
                              viewBox="0 0 12 4"
                              fill="none"
                            >
                              <path
                                d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707"
                                stroke="currentcolor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                          <div
                            id="dropdown-b"
                            className="dropdown-menu rounded-xl shadow-lg bg-white absolute -left-10 top-full w-max mt-2 hidden"
                            aria-labelledby="dropdown-b"
                          >
                            <ul className="py-2">
                              <li>
                                <a
                                  className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                  href="javascript:;"
                                >
                                  Edit
                                </a>
                              </li>
                              <li>
                                <a
                                  className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                  href="javascript:;"
                                >
                                  Remove
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <h6 className="text-xl leading-8 font-semibold text-black mb-1">
                        Jack's Shift
                      </h6>
                      <p className="text-base font-normal text-gray-600">
                        At Food Pack Point
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-12 xl:col-span-7 px-2.5 py-5 sm:p-8 bg-gradient-to-b from-white/25 to-white xl:bg-white rounded-2xl max-xl:row-start-1">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <h5 className="text-xl leading-8 font-semibold text-gray-900">
                        January 2024
                      </h5>
                      <div className="flex items-center">
                        <button className="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M10.0002 11.9999L6 7.99971L10.0025 3.99719"
                              stroke="currentcolor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <button className="text-indigo-600 p-1 rounded transition-all duration-300 hover:text-white hover:bg-indigo-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M6.00236 3.99707L10.0025 7.99723L6 11.9998"
                              stroke="currentcolor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center rounded-md p-1 bg-indigo-50 gap-px">
                      <button className="py-2.5 px-5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:text-white">
                        Day
                      </button>
                      <button className="py-2.5 px-5 rounded-lg bg-indigo-600 text-white text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:text-white">
                        Week
                      </button>
                      <button className="py-2.5 px-5 rounded-lg bg-indigo-50 text-indigo-600 text-sm font-medium transition-all duration-300 hover:bg-indigo-600 hover:text-white">
                        Month
                      </button>
                    </div>
                  </div>
                  <div className="border border-indigo-200 rounded-xl">
                    <div className="grid grid-cols-7 rounded-t-3xl border-b border-indigo-200">
                      <div className="py-3.5 border-r rounded-tl-xl border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                        Sun
                      </div>
                      <div className="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                        Mon
                      </div>
                      <div className="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                        Tue
                      </div>
                      <div className="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                        Wed
                      </div>
                      <div className="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                        Thu
                      </div>
                      <div className="py-3.5 border-r border-indigo-200 bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                        Fri
                      </div>
                      <div className="py-3.5 rounded-tr-xl bg-indigo-50 flex items-center justify-center text-sm font-medium text-indigo-600">
                        Sat
                      </div>
                    </div>
                    <div className="grid grid-cols-7 rounded-b-xl">
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50">
                        <span className="text-xs font-semibold text-gray-400">
                          27
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          28
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          29
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          30
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          31
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          1
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          2
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 relative bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          3
                        </span>
                        {/* <div className="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-purple-50 ">
                          <p className="hidden xl:block text-xs font-medium text-purple-600 mb-px">
                            Meeting
                          </p>
                          <span className="hidden xl:block text-xs font-normal text-purple-600 whitespace-nowrap">
                            10:00 - 11:00
                          </span>
                          <p className="xl:hidden w-2 h-2 rounded-full bg-purple-600" />
                        </div> */}
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          4
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          5
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          6
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white relative border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          7
                        </span>
                        {/* <div className="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-emerald-50 ">
                          <p className="hidden xl:block text-xs font-medium text-emerald-600 mb-px whitespace-nowrap">
                            Developer Meetup
                          </p>
                          <span className="hidden xl:block text-xs font-normal text-emerald-600 whitespace-nowrap">
                            10:00 - 11:00
                          </span>
                          <p className="xl:hidden w-2 h-2 rounded-full bg-emerald-600" />
                        </div> */}
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          8
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-indigo-600 sm:text-white sm:w-6 sm:h-6 rounded-full sm:flex items-center justify-center sm:bg-indigo-600">
                          9
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          10
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          11
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          12
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          13
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          14
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          15
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          16
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          17
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          18
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 relative bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          19
                        </span>
                        {/* <div className="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-sky-50 ">
                          <p className="hidden xl:block text-xs font-medium text-sky-600 mb-px whitespace-nowrap">
                            Developer Meetup
                          </p>
                          <span className="hidden xl:block text-xs font-normal text-sky-600 whitespace-nowrap">
                            10:00 - 11:00
                          </span>
                          <p className="xl:hidden w-2 h-2 rounded-full bg-sky-600" />
                        </div> */}
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          20
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          21
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          22
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          23
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          24
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          25
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          26
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          27
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          28
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          29
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-b border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          30
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-white border-r border-indigo-200 rounded-bl-xl transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-900">
                          31
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          1
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          2
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          3
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 relative bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          4
                        </span>
                        {/* <div className="absolute top-9 bottom-1 left-3.5 p-1.5 xl:px-2.5 h-max rounded bg-purple-50 ">
                          <p className="hidden xl:block text-xs font-medium text-purple-600 mb-px whitespace-nowrap">
                            Friends Meet
                          </p>
                          <span className="hidden xl:block text-xs font-normal text-purple-600 whitespace-nowrap">
                            09:00 - 13:42
                          </span>
                          <p className="xl:hidden w-2 h-2 rounded-full bg-purple-600" />
                        </div> */}
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-r border-indigo-200 transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          5
                        </span>
                      </div>
                      <div className="flex xl:aspect-square max-xl:min-h-[60px] p-3.5 bg-gray-50 border-indigo-200 rounded-br-xl transition-all duration-300 hover:bg-indigo-50 cursor-pointer">
                        <span className="text-xs font-semibold text-gray-400">
                          6
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShiftListPage;

