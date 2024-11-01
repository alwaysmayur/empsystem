import { NextResponse } from 'next/server';
import employeedb from "@/utility/db/mongoDB/schema/userSchema"; // Adjust this import path to your employee schema
import connectionMongoDB from "@/utility/db/mongoDB/connection";

// Create DELETE Request for deleting an employee
export async function DELETE(request: Request, { params }: { params: { employeeId: string } }) {
  const { employeeId } = params;

  try {
    // Validate employeeId
    if (!employeeId) {
      return NextResponse.json({
        status: 422,
        error: "Employee ID is required for deleting an employee.",
      });
    }

    // Connect to MongoDB
    await connectionMongoDB();

    // Delete the employee
    const deletedEmployee = await employeedb.findByIdAndDelete(employeeId);

    if (!deletedEmployee) {
      return NextResponse.json({
        status: 404,
        error: "Employee not found.",
      });
    }

    // Return a success response
    return NextResponse.json({
      status: 200,
      message: "Employee deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete Employee API Error ::", error);
    return NextResponse.json({
      status: 422,
      error: error.message,
    });
  }
}
