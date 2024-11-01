// ./auth.config.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { getUserByEmail } from "@/utility/db/user"; // Assume this function retrieves user from DB

const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Fetch the user from the database
        const user = await getUserByEmail(credentials.email); // Function to fetch user by email
        
        // Check if the user exists and verify the password
        if (user && user.password === credentials.password) { // Use hashed password comparison in production
          return { id: user._id, name: user.name, email: user.email, role: user.role }; // Include role
        } else {
          return null; // Return null if user not found or password doesn't match
        }
      }
    }),
  ],
  session: {
    strategy: "jwt", // Use JWT sessions
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // token.role = user.role; // Add role to the token
      }
      return token;
    },
    async session({ session, token }) {
      // session.user.role = token.role; // Attach role to the session
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
