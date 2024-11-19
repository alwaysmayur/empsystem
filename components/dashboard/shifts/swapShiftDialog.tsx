import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import moment from "moment";

const SwapShiftDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  shifts,
  user,
  onSwapRequest,
}) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Swap Shift</DialogTitle>
          <DialogDescription>
            View available shifts and request a swap.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 h-96 overflow-auto pr-2">
          {shifts.length > 0 ? (
            shifts.map((shift:any) => (
              <div
                key={shift._id}
                className="p-4 border rounded-md flex justify-between items-center"
              >
                <div>
                  <p>
                    <strong>Shift:</strong>  on {moment(shift.shiftDate).format("dddd, MMM Do")}
                  </p>
                  <p>
                    <strong>Time:</strong> {shift.startTime} - {shift.endTime}
                  </p>
                  <p>
                    <strong>Employee:</strong> {shift.employeeId?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Status:</strong> {shift.status}
                  </p>
                </div>
                <div className="space-x-2">
                  {user?.role === "employee" && shift.status === "scheduled" && (
                    <Button
                      variant="outline"
                      onClick={() => onSwapRequest(shift._id,shift.employeeId._id)}
                    >
                      Request Swap
                    </Button>
                  )}
                 
                </div>
              </div>
            ))
          ) : (
            <p>No shifts available for swapping.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SwapShiftDialog;
