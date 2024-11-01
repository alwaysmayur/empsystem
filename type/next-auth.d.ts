// types/next-auth.d.ts
import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// Augment the Session interface
declare module "next-auth" {
  interface Session {
    user: {
      address: string; // Add your custom property here
    } & DefaultSession["user"]; // Retain existing user properties
  }
}

// Augment the User interface if needed
declare module "next-auth" {
  interface User extends NextAuthUser {
    // Add any custom properties here if necessary
    // Example: isAdmin: boolean;
  }
}

// Augment the JWT interface
declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string; // Add custom JWT properties
  }
}
