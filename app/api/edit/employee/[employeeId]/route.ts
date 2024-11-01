import { NextResponse } from "next/server";
import employeedb from "@/utility/db/mongoDB/schema/userSchema"; // Adjust this import path to your employee schema
import connectionMongoDB from "@/utility/db/mongoDB/connection";

// Define the request body interface for better type safety
interface IRequestBody {
  name?: string; // Optional fields
  email?: string; // Optional fields
  password?: string; // Optional fields, ensure to hash before saving
  role?: string; // Optional fields
  mobile?: string; // Optional fields
  address?: string; // Optional fields
}

// Create PUT Request for updating an employee
export async function PUT(
  request: Request,
  { params }: { params: { employeeId: string } }
) {
  // Get employeeId from URL parameters
  const { employeeId } = params;

  // Get request data and parse it into the expected shape
  const req: IRequestBody = await request.json();

  try {
    // Validate required details
    if (!employeeId) {
      return NextResponse.json({
        status: 422,
        error: "Employee ID is required for updating an employee.",
      });
    }

    // Destructure the request body
    const { name, email, password, role, mobile, address } = req;

    // Validate role if provided
    if (role) {
      const validRoles = ["admin", "hr", "employee"];
      if (!validRoles.includes(role)) {
        return NextResponse.json({
          status: 422,
          error: `Role must be one of the following: ${validRoles.join(", ")}`,
        });
      }
    }

    // Connect to MongoDB
    await connectionMongoDB();

    // Validate employee email with the database if email is provided
    if (email) {
      const preEmployee: any = await employeedb.findOne({ email });

      if (preEmployee) {
        // If email already exists and it's not the current employee's email, return an error
        if (preEmployee._id.toString() !== employeeId) {
          return NextResponse.json({
            status: 422,
            error: "This Email is Already Exist",
          });
        }
      }
    }

    // Update the employee
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      // Hash the password before saving (assuming you have a hash function)
      updateData.password = password; // Replace this with the hashed password
    }
    if (role) updateData.role = role;
    if (mobile) updateData.mobileNumber = mobile; // Ensure field names match your schema
    if (address) updateData.address = address;

    const updatedEmployee = await employeedb.findByIdAndUpdate(
      employeeId,
      updateData,
      { new: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json({
        status: 404,
        error: "Employee not found.",
      });
    }

    // Return the response with the updated data
    return NextResponse.json({
      status: 200,
      updatedEmployee,
    });
  } catch (error: any) {
    console.error("Update Employee API Error ::", error);
    return NextResponse.json({
      status: 422,
      error: error.message,
    });
  }
}
