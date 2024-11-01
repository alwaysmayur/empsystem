/* eslint-disable @typescript-eslint/no-unused-vars */

import employeedb from "../../../../utility/db/mongoDB/schema/userSchema"; // Adjust this import path to your employee schema
import connectionMongoDB from "../../../../utility/db/mongoDB/connection";
import { getDataFromToken } from '@/helper/getDataFromToken';
import { NextResponse, NextRequest } from "next/server";

// Create GET Request for retrieving the list of employees
export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectionMongoDB();
      // Extract user ID from the authentication token
    const userId = await getDataFromToken(request);
    
    // Fetch all employees from the database
    // const user: = await employeedb.find({_id:userId});

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
