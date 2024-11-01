
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userdb from "../../../utility/db/mongoDB/schema/userSchema";
import connectionMongoDB from "../../../utility/db/mongoDB/connection";

import { NextResponse } from "next/server";

// Define the request body type
interface LoginRequestBody {
  email: string;
  password: string;
}

// Handle the POST request
export async function POST(request: Request) {
  try {
    const req: LoginRequestBody = await request.json();
    const { email, password } = req;
    
    // Validate the email and password
    if (!email || !password) {
      return NextResponse.json({
        status: 422,
        error: "Fill all the details",
      });
    }

    // Make MongoDB database connection
    await connectionMongoDB();

    // Validate user email
    const userValid = await userdb.findOne({ email: email });

    if (userValid) {
      // Validate password
      const isMatch = await bcrypt.compare(password, userValid.password);

      if (!isMatch) {
        return NextResponse.json({
          status: 422,
          error: "Invalid password",
        });
      } else {
        // Generate JWT token
        const token = await generateAuthtoken(userValid);
        // cookies().set("token", token);

        // Update the user with the token
        const updatedUser = await userdb.updateOne(
          { _id: userValid.id },
          { $set: { token: token } }
        );

        // Set user details and token
        const result = {
          updatedUser,
          token,
          role:userValid.role
        };

        return NextResponse.json({
          status: 201,
          result,
        });
      }
    } else {
      return NextResponse.json({
        status: 422,
        error: "Invalid Email",
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 401,
      error: (error as Error).message, // Ensure proper error handling
    });
  }
}

// Generate JWT token
async function generateAuthtoken(user: any): Promise<string | undefined> {
  try {
    return jwt.sign({ _id: user._id }, process.env.ACCESS_KEY as string, {
      expiresIn: "1d",
    });
  } catch (error) {
    console.error(error);
    return undefined; // Handle error appropriately
  }
}
