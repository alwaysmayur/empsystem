// ./auth.ts
import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter"; // We will still use MongoDBAdapter
import {clientPromise} from "./lib/mongodb"; // MongoClient connection (still used for NextAuth)
import authConfig from "./auth.config";
import { connectToDatabase } from "./lib/mongodb"; // Import the Mongoose connection

// Ensure the database is connected with Mongoose
connectToDatabase();

// Use the MongoClient for NextAuth adapter, not Mongoose
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise), // Use MongoClient for NextAuth
  ...authConfig,
});
