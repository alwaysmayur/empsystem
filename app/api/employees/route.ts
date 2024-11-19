/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from 'next/server';
import userdb from "@/utility/db/mongoDB/schema/userSchema";
import connectionMongoDB from "@/utility/db/mongoDB/connection";

// Define the request body interface for type safety
interface IRequestBody {
  name: string;
  email: string;
  password: string;
  role?: string; // Optional role
  mobileNumber: string;
  address?: string; // Optional address
  jobRole: string; // Required job role
}

// Create POST Request
export async function POST(request: Request) {
  // Parse the request body
  const req: IRequestBody = await request.json();

  try {
    // Destructure the request body
    const { name, email, password, role = "employee", mobileNumber, address, jobRole } = req;
    
    // Validate required fields
    if (!name || !email || !password || !mobileNumber || !jobRole) {
      return NextResponse.json({
        status: 422,
        error: "Please fill up all required fields (name, email, password, mobile number, and job role).",
      });
    }

    // Connect to MongoDB
    await connectionMongoDB();

    // Check if a user with the given email already exists
    const preuser = await userdb.findOne({ email });

    if (preuser) {
      return NextResponse.json({
        status: 422,
        error: "This email is already registered.",
      });
    }

    // Create a new user instance with the provided data
    const newUser = new userdb({
      name,
      email,
      password,
      role, // Default role is "employee" if not provided
      mobileNumber,
      address: address || "", // Use an empty string if address is not provided
      jobRole,
    });

    // Save the user to the database
    const storeData = await newUser.save();

    // Respond with the created user data
    return NextResponse.json({
      status: 201,
      message: "User created successfully.",
      data: storeData,
    });
  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json({
      status: 500,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
}
