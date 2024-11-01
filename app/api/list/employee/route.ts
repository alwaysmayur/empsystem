// /app/api/employees/route.ts
import { NextResponse } from 'next/server';
import employeedb from "../../../../utility/db/mongoDB/schema/userSchema"; // Adjust this import path to your employee schema
import connectionMongoDB from "../../../../utility/db/mongoDB/connection";

// Create GET Request for retrieving the list of employees
export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await connectionMongoDB();

    // Fetch all employees from the database
    const employees = await employeedb.find({});

    // Return the response with the employees data
    return NextResponse.json({
      status: 200,
      employees,
    });
  } catch (error: any) {
    console.error("Fetch Employees API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: "Internal Server Error",
    });
  }
}
