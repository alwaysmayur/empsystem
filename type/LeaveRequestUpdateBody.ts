export interface LeaveRequestUpdateBody {
    status?: "pending" | "approved" | "rejected";
    cancel?: boolean;
  }