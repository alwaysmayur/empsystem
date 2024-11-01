/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useEffect, useState } from "react";
import { ShiftTable } from "@/components/auth/shiftTable";
import { Button } from "@/components/ui/button";
import ShiftForm from "@/components/auth/shiftForm";
import { Shift } from "@/type/Shift"; // Your Shift type
import { getToken } from "next-auth/jwt"; // Get token function
import { CalendarPlus } from "lucide-react"; // Icon

const ShiftListPage = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [newShift, setNewShift] = useState(false); // Track if adding a new shift
  const [editingShift, setEditingShift] = useState<Shift | null>(null); // Track the shift being edited
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Track dialog state

  const fetchShifts = async () => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });

    const res = await fetch("/api/list/shift", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch shifts", await res.text());
      return;
    }

    const data = await res.json();
    setShifts(data.shifts);
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleDelete = async (id: string) => {
    const token = await getToken({
      req: { headers: { cookie: document.cookie } },
    });
    await fetch(`/api/delete/shift/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchShifts(); // Refresh the shift list
  };

  const handleFormClose = () => {
    setNewShift(false);
    setEditingShift(null); // Clear the editing state
    fetchShifts(); // Refresh the shift list after form closes
  };

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift); // Set shift to be edited
    setIsDialogOpen(true); // Open dialog
  };

  const handleDialogClose = () => {
    setEditingShift(null); // Clear editing state
    setIsDialogOpen(false); // Close dialog
  };

  return (
    <div className="p-4">
      <Button
        variant="outline"
        className="gap-2 flex justify-center items-center"
        onClick={() => {
          setNewShift(true);
          setIsDialogOpen(true);
        }}
      >
        <span>Add Shift</span> <CalendarPlus className="w-5 h-5" />
      </Button>
      {/* Render the dialog for adding or editing shifts */}
      {isDialogOpen && (
        <ShiftForm
          onClose={handleDialogClose}
          refreshShifts={fetchShifts}
          editingShift={newShift ? null : editingShift} // Pass shift data if editing
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      )}
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
