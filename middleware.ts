import { NextRequest } from "next/server";

// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt"; // Use NextAuth's JWT to check if user is authenticated

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Check if token is available, if not, redirect to login page
  if (!token) {
    const loginUrl = new URL("/emp/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next(); // Continue if the user is authenticated
}

// Match middleware to specific routes where authentication is required (e.g., /dashboard, /profile)
export const config = {
  matcher: ["/emp/dashboard", "/emp/profile"], // Add all protected routes here
};
