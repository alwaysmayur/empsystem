import { LoginForm } from "@/components/auth/login-form"
import Head from "next/head";
  
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Login | StaffTrack",
  description: "StaffTrack management",
};

export default function Page() {
  return (
    
    <div className="flex h-screen w-full items-center justify-center px-4">
          <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <LoginForm />
    </div>
  )
}
