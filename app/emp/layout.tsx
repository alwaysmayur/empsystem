import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils"
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      // className={cn(
      //   "h-screen flex w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800",font.className
      // )}
      className={cn(
        "h-screen flex w-full items-center justify-center bg-gray-900",font.className
      )}
    >
      {children}
    </div>
  );
};

export default AuthLayout;
