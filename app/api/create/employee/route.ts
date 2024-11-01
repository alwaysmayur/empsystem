import { NextResponse } from 'next/server';
import employeedb from "../../../../utility/db/mongoDB/schema/userSchema";
import connectionMongoDB from "../../../../utility/db/mongoDB/connection";

interface IRequestBody {
  name: string;
  email: string;
  password: string;
  role: string;
  mobile: string;
  address?: string;
}

export async function POST(request: Request) {
  const req: IRequestBody = await request.json();

  try {
    const { name, email, password, role, mobile, address } = req;

    if (!name || !email || !password || !role || !mobile) {
      return NextResponse.json({
        status: 422,
        error: "Please fill up all details",
      });
    }
    
    const validRoles = ["admin", "hr", "employee"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({
        status: 422,
        error: `Role must be one of the following: ${validRoles.join(", ")}`,
      });
    }

    await connectionMongoDB();

    const preEmployee = await employeedb.findOne({ email });
    if (preEmployee) {
      return NextResponse.json({
        status: 422,
        error: "This Email is Already Exist",
      });
    }

    const finalEmployee = new employeedb({
      name,
      email,
      password, // Ensure to hash the password before saving it
      role,
      mobileNumber: mobile,
      address,
    });

    const storeData = await finalEmployee.save();

    return NextResponse.json({
      status: 201,
      storeData,
    });
  } catch (error: unknown) {
    console.error("Add Employee API Error ::", error);
    return NextResponse.json({
      status: 422,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    });
  }
}

export async function GET() {
  try {
    await connectionMongoDB();
    const employees = await employeedb.find({});

    return NextResponse.json({
      status: 200,
      employees,
    });
  } catch (error: unknown) {
    console.error("Get Employees API Error ::", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch employees.",
    });
  }
}
