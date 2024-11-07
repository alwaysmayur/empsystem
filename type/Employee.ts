export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  mobileNumber: string;
  address: string;
  password?: string; // Make password optional
}
