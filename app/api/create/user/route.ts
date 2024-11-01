/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from 'next/server';
import userdb from "../../../../utility/db/mongoDB/schema/userSchema";
import connectionMongoDB from "../../../../utility/db/mongoDB/connection";
import { KanbanSquare, KeyboardOff, LucideKanbanSquareDashed } from 'lucide-react';
import { daysToWeeks } from 'date-fns';

// Define the request body interface for better type safety
interface IRequestBody {
  name: string;
  email: string;
  password: string;
}

// Create POST Request
export async function POST(request: Request) {
  // Get request data and parse it into the expected shape
  const req: IRequestBody = await request.json();

  try {
    // Destructure the request body
    const { name, email, password } = req;

    // Validate required details
    if (!name || !email || !password ) {
      return NextResponse.json({
        status: 422,
        error: "Please fill up all details",
      });
    }

    // Connect to MongoDB
    await connectionMongoDB();

    // Validate user email with the database
    const preuser = await userdb.findOne({ email });

    if (preuser) {
      // If email already exists, return an error
      return NextResponse.json({
        status: 422,
        error: "This Email is Already Exist",
      });
    }

    // Create a new user
    const finalUser = new userdb({
      name,
      email,
      password,
    });

    // Save the user in the database
    const storeData = await finalUser.save();

    // Return the response with the stored data
    return NextResponse.json({
      status: 201,
      storeData,
    });
  } catch (error: any) {
    console.error("Register API Error ::", error);
    return NextResponse.json({
      status: 422,
      error: error.message,
    });
  }
}
