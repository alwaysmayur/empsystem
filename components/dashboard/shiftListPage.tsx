"use client";

import { useEffect, useState } from "react";
import { ShiftTable } from "@/components/dashboard/shifts/shiftTable";
import { Button } from "@/components/ui/button";
import ShiftForm from "@/components/dashboard/shifts/shiftForm";
import { Shift } from "@/type/Shift";
import { Employee } from "@/type/Employee"; // Type for Employee
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

import dayjs, { Dayjs } from "dayjs";
import moment from "moment";

import CustomeCalendar from "./shifts/calender";
import SwapShiftDialog from "./shifts/swapShiftDialog";

import { useUser } from "@/app/context/UseContex"; // Assuming you have a user context for current user info

import Swal from "sweetalert2";

const ShiftListPage: any = (props) => {
  const user: any = useUser();
  const [allShifts, setAllShifts] = useState<Shift[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [newShift, setNewShift] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]); // State for employee list
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all"); // Employee filter
  const [selectedJobRole, setSelectedJobRole] = useState<string>("all"); // role filter
  const [startDate, setStartDate] = useState<string>(""); // Start date filter
  const [endDate, setEndDate] = useState<string>(""); // End date filter
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [selectedSwapShift, setSelectedSwapShift] = useState<Shift | null>(
    null
  );
  const [availbleDates, setAvailbleDates] = useState<any>();

  const [updateShiftsFlag, setupdateShiftsFlag] = useState(false);

  const [shiftHours, setShiftHours] = useState<any>();
  const [typeEmp, setTypeEmp] = useState<any>();
  const fetchShifts = async () => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const query = new URLSearchParams();
    if (selectedEmployee) query.append("employeeId", selectedEmployee);
    if (startDate) query.append("startDate", startDate);
    if (endDate) query.append("endDate", endDate);

    const res = await fetch(`/api/list/shift`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: selectedDate.format(),
        employeeId: selectedEmployee,
        role: selectedJobRole,
        swap: false,
      }),
    });

    if (!res.ok) {
      console.error("Failed to fetch shifts", await res.text());
      return;
    }

    const data = await res.json();
    setAvailbleDates(data.dates);
    if (props.isOffeShift == false) {
      setShifts(data.shifts);
      setShiftHours(data.totalHours)
    }
  };

  const fetchSwapShifts = async () => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const res = await fetch(`/api/list/shift`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: selectedDate.format(),
        employeeId: "all",
        swap: true,
      }),
    });

    if (!res.ok) {
      console.error("Failed to fetch shifts", await res.text());
      return;
    }

    const data = await res.json();
    setAllShifts(data.shifts);
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
    fetchSwapShifts();
  }, [
    selectedEmployee,
    selectedJobRole,
    selectedDate,
    startDate,
    endDate,
    updateShiftsFlag,
  ]);

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

  const [dropdownShiftId, setDropdownShiftId] = useState<string | null>(null); // Track which shift's dropdown is open

  const toggleDropdown = (shiftId: string) => {
    setDropdownShiftId(dropdownShiftId === shiftId ? null : shiftId);
  };

  const handleSelectChange = (value: string) => {
    let type = employees.filter(employee => employee._id == value);
    if (type.length > 0) {
      setTypeEmp(type[0].type)
    }
    
    setSelectedEmployee(value);
    // Optionally, you can handle filtering based on the selected employee
    // For example, you could trigger a re-fetch or filter a list of shifts here
  };
  const handleSwap = (shift: Shift) => {
    setSelectedSwapShift(shift); // Set the shift to swap
    setIsSwapDialogOpen(true); // Open the dialog
  };

  const handleSwapClose = () => {
    setIsSwapDialogOpen(false);
    setSelectedSwapShift(null);
  };

  const handleSwapRequest = async (
    shiftId: string,
    newShiftId: string,
    requestedUserId: string
  ) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const res = await fetch(`/api/shift/swap-request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requesterId: user._id,
        requestedId: requestedUserId,
        requesterShiftId: shiftId,
        requestedShiftId: newShiftId,
      }),
    });

    const data = await res.json();

    if (data.status == 200) {
      console.log(`Swap requested for shift ${shiftId}`);
      fetchShifts(); // Refresh the shifts after the request
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: data.error,
      });

      // console.error("Failed to request swap", await res.text());
    }

    setIsSwapDialogOpen(false); // Close the swap dialog
    setSelectedSwapShift(null);
  };

  const handleApproveSwap = async (swapRequestId: string, status: any) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const res = await fetch("/api/shift/swap", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        swapRequestId: swapRequestId, // Pass the swapRequestId
        action: status, // Approve the swap
      }),
    });

    const data = await res.json();

    if (data.status == 200) {
      console.log(`Swap approved for request ${swapRequestId}`);
      fetchShifts(); // Refresh the shifts after approval
    } else {
      console.error("Failed to approve swap", await res.text());
    }
  };

  const handleOffer = async (shift: Shift) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const res = await fetch(`/api/shift/createOffer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shiftId: shift._id,
      }),
    });

    const data = await res.json();

    if (data.status == 201) {
      console.log(`Swap requested for shift `);
      Swal.fire({
        icon: "success",
        title: "Offer created",
        text: "you offer is created",
      });
      fetchShifts(); // Refresh the shifts after the request
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: data.error,
      });
      setupdateShiftsFlag(!updateShiftsFlag);
      // console.error("Failed to request swap", await res.text());
    }

    setIsSwapDialogOpen(false); // Close the swap dialog
    setSelectedSwapShift(null);
  };

  const handleOfferAccept = async (shift: Shift) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const res = await fetch(`/api/shift/accept`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offerId: shift._id,
      }),
    });

    const data = await res.json();

    if (data.status == 200) {
      Swal.fire({
        icon: "success",
        title: "Offer Accepted",
        text: "Shift is accepted by you",
      });
      fetchShifts(); // Refresh the shifts after the request
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: data.error,
      });

      // console.error("Failed to request swap", await res.text());
    }
    setIsSwapDialogOpen(false); // Close the swap dialog
    setSelectedSwapShift(null);
  };

  useEffect(() => {
    fetch("/api/shift/getOfferedShifts")
      .then((res) => res.json())
      .then((data) => {
        if (props.isOffeShift) {
          setShifts(data.shifts);
        }
      });
  }, [props.isOffeShift, updateShiftsFlag]);

  
  return (
    user ?
    <div className="p-4">
      {(user?.role == "admin" || user?.role == "hr") && !props.isOffeShift ? (
        <div className="flex gap-4 mb-4">
          {/* Date Range Filters */}

          <Select value={selectedEmployee} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Employees" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Employees</SelectItem>
                {employees?.map((employee) => (
                  <SelectItem key={employee._id} value={employee._id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={selectedJobRole}
            onValueChange={(value) => {
              setSelectedJobRole(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="food packer">Food Packer</SelectItem>
                <SelectItem value="cashier">Cachier</SelectItem>
                <SelectItem value="kitchen">Kitchen</SelectItem>
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
      ) : (
        ""
      )}

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

        {(shifts.length > 0 && !props.isOffeShift) || props.isOffeShift}
        <section
          className={`${
            !props.isOffeShift
              ? "relative bg-gray-100 w-auto rounded-xl shadow-lg p-6 sm:p-10  mx-auto"
              : "relative bg-gray-100 w-auto rounded-xl shadow-lg p-6 sm:p-3 mx-auto"
          }`}
        >
          <div
            className={`${
              !props.isOffeShift ? "grid grid-cols-12 gap-8" : " "
            }`}
          >
            <div className="col-span-12 xl:col-span-5">
              <div className="mb-6">
                {!props.isOffeShift ? (
                  <div className="flex content-center items-center gap-4">
                    <h2 className="text-3xl font-bold text-gray-900">
                      Upcoming Shifts
                    </h2>
                    {
                     ( user?.role !== "admin" && user?.role !== "hr") || selectedEmployee !== "all" ? 
                      <p className="text-white bg-gray-900 px-2 py-0.5 rounded-md text-sm font-noraml">Working hours {typeEmp == "Full Time"? `${shiftHours}hr / 56hr` :  `${shiftHours}hr / 24hr` }</p>
                      : ""
                    }
                  </div>
                ) : (
                  <h2 className="text-xl font-bold text-gray-900">
                    Offered Shifts
                  </h2>
                )}
                <p className="text-sm text-gray-600">
                  Don’t miss your schedule
                </p>
              </div>

              <div className="flex flex-col gap-y-3 h-[480px] pb-10 overflow-y-auto overflow-x-hidden pr-2">
                {shifts?.length > 0
                  ? shifts.map((shift: any) => (
                    
                      <div key={shift._id} className=" rounded-xl bg-white">
                     
                        <div className=" m-3 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-md  font-bold text-gray-600 ">
                              {moment(shift.shiftDate).format("dddd, MMMM Do")}
                            </p>
                            <div className="dropdown relative inline-flex">
                              <button
                                type="button"
                                onClick={() => toggleDropdown(shift._id)}
                                className="dropdown-toggle inline-flex justify-center py-2.5 px-1 items-center gap-2 text-sm text-black rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 hover:text-purple-600"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="4"
                                  viewBox="0 0 12 4"
                                  fill="none"
                                >
                                  <path
                                    d="M1.85624 2.00085H1.81458M6.0343 2.00085H5.99263M10.2124 2.00085H10.1707"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              </button>
                              <div
                                className={`dropdown-menu rounded-xl shadow-lg bg-white absolute top-full -left-10 w-max mt-2 ${
                                  dropdownShiftId === shift._id
                                    ? "block"
                                    : "hidden"
                                }`}
                                aria-labelledby="dropdown-default"
                              >
                                {user?.role == "admin" || user?.role == "hr" ? (
                                  <ul className="py-2">
                                    <li>
                                      <button
                                        className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                        onClick={() => handleEdit(shift)}
                                      >
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                        onClick={() => handleDelete(shift._id)}
                                      >
                                        Remove
                                      </button>
                                    </li>
                                  </ul>
                                ) : (
                                  <ul className="py-2">
                                    {shift.isOffered ? (
                                      <li>
                                        <button
                                          className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                          onClick={() =>
                                            handleOfferAccept(shift)
                                          }
                                        >
                                          Accept
                                        </button>
                                      </li>
                                    ) : (
                                      <>
                                        {" "}
                                        <li>
                                          <button
                                            className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                            onClick={() => handleSwap(shift)}
                                          >
                                            Swap
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            className="block px-6 py-2 text-xs hover:bg-gray-100 text-gray-600 font-medium"
                                            onClick={() => handleOffer(shift)}
                                          >
                                            Offer
                                          </button>
                                        </li>
                                      </>
                                    )}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm  font-normal text-gray-600">
                            {shift.employeeId.jobRole.toUpperCase() ||
                              "Shift Location"}
                          </p>
                          <h6 className="text-sm leading-8 font-normal text-gray-500 mb-1">
                            {`${shift.startTime} - ${shift.endTime}`}
                          </h6>
                          <h6 className="text-sm leading-8 font-normal text-gray-700 mb-1">
                            {shift.employeeId.name || "Shift Title"}
                          </h6>
                        </div>

                        {shift.isOffered ? (
                          <div className="flex ps-2 border-t py-2 justify-start items-center content-center mt-2 gap-4">
                            <p className="cursor-pointer bg-blue-500 text-md  text-white font-normal  px-2 rounded-sm">
                              {`Shift is Offered`}
                            </p>
                          </div>
                        ) : (
                          ""
                        )}
                      
                        
                        {shift.swapRequests?.length > 0 &&
                        user.role === "employee" ? (
                          shift.swapRequests[0].status == "pending" && shift.swapRequests[0].requesterId !== user._id ? (
                            <div className="px-3 pb-3 ">
                              <div className="flex items-center content-center gap-2">
                                <p className="cursor-pointer text-sm  text-gray-800 rounded-md">
                                  {`${shift.swapRequests[0].user} wants to swap the shift `}
                                </p>
                              </div>
                              <div className="flex items-center content-center gap-2">
                                <p className="cursor-pointer text-sm font-normal text-gray-500 rounded-md">
                                  {`${moment(
                                    shift.swapRequests[0].shiftDate
                                  ).format("dddd, MMM Do")} `}
                                </p>
                                <p className="cursor-pointer text-sm font-normal text-gray-500 rounded-md">
                                  {`${shift.swapRequests[0].startTime} - ${shift.swapRequests[0].endTime}`}
                                </p>{" "}
                              </div>
                              <div className="flex gap-4 pt-2 ">
                                <button
                                  onClick={() =>
                                    handleApproveSwap(
                                      shift.swapRequests[0]._id,
                                      "approved"
                                    )
                                  }
                                  className="py-1 border border-green-500 hover:bg-green-400 px-2 rounded-sm text-gray-900"
                                  aria-label="Approve swap request"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleApproveSwap(
                                      shift.swapRequests[0]._id,
                                      "declined"
                                    )
                                  }
                                  className="py-1 border border-red-500 hover:bg-red-400 px-2 rounded-sm text-gray-900"
                                  aria-label="Decline swap request"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ) : shift.swapRequests[0].status == "approved" &&
                            shift.swapRequests[0].requesterId !== user._id ? (
                            <>
                              <div className="flex ps-2 border-t py-2 justify-start items-center content-center mt-2 gap-4">
                                <p className="cursor-pointer bg-blue-500 text-md  text-white font-normal  px-2 rounded-sm">
                                  {`Swaped Shift`}
                                </p>
                                <p className="cursor-pointer   text-gray-600  px-2 rounded-sm">
                                  {`${
                                    shift.swapRequests[0].user
                                  } 's shift - ${moment(
                                    shift.swapRequests[0].shiftDate
                                  ).format("DD MMM YYYY")}`}
                                </p>
                              </div>
                            </>
                          ) : shift.swapRequests[0].status !== "approved" && shift.swapRequests[0].requesterId ==
                            shift.employeeId._id ? (
                            <div className="flex ps-2 border-t py-2 justify-start items-center content-center mt-2 gap-4">
                              <p className="cursor-pointer bg-blue-500 text-md  text-white font-normal  px-2 rounded-sm">
                                {`Swaped declined`}
                              </p>
                            </div>
                          ) : (
                            ""
                          )
                        ) : null}
                      </div>
                    ))
                  : "No shifts available"}
              </div>
            </div>

            {!props.isOffeShift && availbleDates ? (
              <CustomeCalendar
                setSelectedDate={setSelectedDate}
                selectedDate={selectedDate}
                shifts={availbleDates}
              />
            ) : (
              ""
            )}
          </div>
        </section>

        {/* Swap Shift Dialog */}
        {isSwapDialogOpen && selectedSwapShift && (
          <SwapShiftDialog
            isDialogOpen={isSwapDialogOpen}
            setIsDialogOpen={setIsSwapDialogOpen}
            shifts={allShifts}
            user={user}
            onSwapRequest={(shiftId: any, userId: any) => {
              console.log(`Request swap for shift: ${shiftId}`);
              handleSwapClose(); // Close dialog after action
              handleSwapRequest(selectedSwapShift._id, shiftId, userId);
            }}
          />
        )}
      </div>
    </div> : ""
  );
};

export default ShiftListPage;
