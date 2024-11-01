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
import ShiftForm from "@/components/auth/shiftForm"; // Your shift form component
import { CalendarDays, Trash2 } from "lucide-react"; // Icons
import { Shift } from "@/type/Shift"; // Import the Shift type

interface TableProps {
  data: Shift[]; // Define your shift type
  refreshShifts: () => Promise<void>; // Refresh shifts after edit
  onDelete: (id: string) => void; // Callback for deleting a shift
  onEdit: (shift: Shift) => void; // Callback for editing a shift
}

export const ShiftTable: React.FC<TableProps> = ({
  data,
  refreshShifts,
  onDelete,
  onEdit,
}) => {
  const [editingShift, setEditingShift] = useState<Shift | null>(null); // Track the shift being edited
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Track dialog state

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift); // Set the shift to be edited
    setIsDialogOpen(true); // Open the dialog when edit is clicked
  };

  const handleDialogClose = () => {
    setEditingShift(null); // Clear the shift after the dialog closes
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <>
      {data.length > 0 ? (
        <Table className="bg-gray-100 border-gray-900 rounded-xl">
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Start Date & Time</TableHead>
              <TableHead>End Date & Time</TableHead>
              <TableHead>Approved</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((shift) => (
              <TableRow key={shift._id}>
                <TableCell>{shift.employeeId.name}</TableCell>{" "}
                {/* Render the employee's name */}
                <TableCell>
                  {new Date(shift.startDate).toLocaleDateString()}{" "}
                  {new Date(shift.startDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {new Date(shift.endDate).toLocaleDateString()}{" "}
                  {new Date(shift.endDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>{shift.isApproved ? "Yes" : "No"}</TableCell>
                <TableCell>{shift.status}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    className="rounded-full py-0.5 px-2  hover:bg-gray-500 hover:text-white  text-black"
                    onClick={() => handleEdit(shift)}
                  >
                    <CalendarDays className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={"ghost"}
                    className="rounded-full py-0.5 px-2 hover:bg-red-400 hover:text-white text-black"
                    onClick={() => onDelete(shift._id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        ""
      )}

      <ShiftForm
        onClose={handleDialogClose}
        refreshShifts={refreshShifts}
        editingShift={editingShift} // Pass the shift data to the form
        isDialogOpen={isDialogOpen} // Pass isDialogOpen
        setIsDialogOpen={setIsDialogOpen} // Pass setIsDialogOpen
      />
    </>
  );
};
