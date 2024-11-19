export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string; // Role can be 'admin', 'HR', 'employee', or 'hr'
  mobileNumber: string;
  address: string;
  jobRole: string; // New field for job role
  password?: string; // Password remains optional
}
