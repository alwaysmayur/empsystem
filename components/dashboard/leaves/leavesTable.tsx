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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import LeaveForm from "@/components/dashboard/leaves/leavesForm"; // Your leave form component
import { Check, X } from "lucide-react"; // Icons
import { LeaveRequest } from "@/type/LeaveRequest"; // Import the LeaveRequest type

interface TableProps {
  onStatusUpdate: (
    id: string,
    newStatus: "approved" | "rejected" | "pending"
  ) => void;
  data: LeaveRequest[]; // Define your leave request type
  refreshLeaves: () => Promise<void>; // Refresh leaves after edit
  onDelete: (id: string) => void; // Callback for deleting a leave request
  onEdit: (leave: LeaveRequest) => void; // Callback for editing a leave request,
  user: any;
}

export const LeaveTable: React.FC<TableProps> = ({
  data,
  refreshLeaves,
  onDelete,
  onEdit,
  onStatusUpdate,
  user,
}) => {
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null); // Track the leave being edited
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Track dialog state

  const handleEdit = (leave: LeaveRequest) => {
    setEditingLeave(leave); // Set the leave to be edited
    setIsDialogOpen(true); // Open the dialog when edit is clicked
  };

  const handleDialogClose = () => {
    setEditingLeave(null); // Clear the leave after the dialog closes
    setIsDialogOpen(false); // Close the dialog
  };

  return (
    <>
      {data?.length > 0 ? (
        <Table className="bg-gray-100 border-gray-900 rounded-xl">
          <TableHeader>
            <TableRow>
              {user?.role == "admin" || user?.role == "hr" ? (
                <TableHead>Employee Name</TableHead>
              ) : (
                ""
              )}
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date & Time</TableHead>
              <TableHead>End Date & Time</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              {user?.role == "admin" || user?.role == "hr" ? (
                <TableHead>Actions</TableHead>
              ) : (
                ""
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((leave) => (
              <TableRow key={leave._id}>
                {user?.role == "admin" || user?.role == "hr" ? (
                  <TableCell>{leave.employeeId.name}</TableCell>
                ) : (
                  ""
                )}
                {/* Render the employee's name */}
                <TableCell>{leave.leaveType}</TableCell>
                <TableCell>
                  {new Date(leave.startDate).toLocaleDateString()}{" "}
                  {leave?.startTime ? new Date(leave.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }):""}
                </TableCell>
                <TableCell>
                  {new Date(leave.endDate).toLocaleDateString()}{" "}
                  {leave?.endTime ? new Date(leave.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }): ""}
                </TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>{leave.status}</TableCell>
                {user?.role == "admin" || user?.role == "hr" ? (
                  <TableCell className="space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            className="rounded-full py-0.5 px-2 hover:bg-green-400 hover:text-white text-green-500"
                            onClick={() =>
                              onStatusUpdate(leave._id, "approved")
                            }
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="border-gray-500 bg-white text-gay-800">
                          <p>Approve</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant={"ghost"}
                            className="rounded-full py-0.5 px-2 hover:bg-red-400 hover:text-white text-red-500"
                            onClick={() =>
                              onStatusUpdate(leave._id, "rejected")
                            }
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="border-gray-500 bg-white text-gay-800">
                          <p>Reject</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                ) : (
                  ""
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>No leave requests available.</div>
      )}

      <LeaveForm
        onClose={handleDialogClose}
        refreshLeaves={refreshLeaves}
        editingLeave={editingLeave} // Pass the leave data to the form
        isDialogOpen={isDialogOpen} // Pass isDialogOpen
        setIsDialogOpen={setIsDialogOpen} // Pass setIsDialogOpen
        user={user} // Pass user data to the form
      />
    </>
  );
};
