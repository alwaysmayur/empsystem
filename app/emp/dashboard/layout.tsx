import { Poppins } from "next/font/google";
import Sidebar from "@/components/auth/sidebar"; // Adjust the import path as needed
import Header from "@/components/auth/mainHeader"; // Adjust the import path as needed
import { cn } from "@/lib/utils";

import { auth } from "@/auth";
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth(); // Fetch session data
  console.log({session});
  
  return session ? (
    <div className={cn("flex w-full  h-screen", font.className)}>
      <Sidebar /> {/* Sidebar remains fixed on the left */}
      <div className="flex-1 flex flex-col ml-64">
    
        {/* Added margin-left to accommodate Sidebar width */}
        <Header /> {/* Header is fixed to the top */}
        <main className="flex-1 overflow-y-auto ">

          {/* Add padding-top to avoid overlap with the header */}
          {children}
        </main>
      </div>
    </div>
  ) : (
    <p>Please sign</p>
  );
};

export default AuthLayout;
