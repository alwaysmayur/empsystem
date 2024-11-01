import { NextApiRequest, NextApiResponse } from "next";
import EmployeeModel from "@/utility/db/mongoDB/schema/userSchema"; // Adjust the import based on your structure
import { getToken } from "next-auth/jwt";
import { connectToDatabase } from "@/lib/mongodb"; // Ensure you have the database connection function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase(); // Connect to the database

  // Verify the JWT token
  const token = await getToken({ req: req as any  });

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" }); // Return unauthorized if token is not present
  }

  if (req.method === "GET") {
    const employees = await EmployeeModel.find({});
    return res.status(200).json(employees);
  }

  if (req.method === "POST") {
    const { name, email, password, role, mobile, address } = req.body;
    const newEmployee = await EmployeeModel.create({ name, email, password, role, mobile, address });
    return res.status(201).json(newEmployee);
  }

  if (req.method === "PUT") {
    const { id, ...updates } = req.body; // Assuming id is sent in the body for updates
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(id, updates, { new: true });
    return res.status(200).json(updatedEmployee);
  }

  if (req.method === "DELETE") {
    const { id } = req.body; // Assuming id is sent in the body for deletion
    await EmployeeModel.findByIdAndDelete(id);
    return res.status(204).send(null); // No content
  }

  return res.status(405).json({ message: "Method not allowed" }); // Handle unsupported methods
}
