"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // For conditional class merging
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import {
  CalendarClock,
  Caravan,
  CircleGauge,
  UserRoundPlus,
  User,
  LogOut,
} from "lucide-react"; // Icons

const Sidebar = () => {
  const router = useRouter();
  return (
    <aside
      className={cn(
        "flex flex-col fixed border-r border-gray-800 inset-y-0 left-0 bg-gray-900 text-white w-64 h-full shadow-md z-50"
      )}
    >
      <div className="flex items-center justify-between h-5 p-8 border-gray-800 border-b">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
      <nav className="flex flex-col w-full mt-5 space-y-2">
        <NavigationMenu className="flex max-w-full mx-4 flex-col justify-start">
          <NavigationMenuItem className="w-full">
            <Button
              variant="ghost"
              className="w-full flex justify-start items-center text-left"
              onClick={() => router.push("/emp/dashboard/employees")}
            >
              <UserRoundPlus className="mr-2 h-5 w-5" />
              <span>Employees</span>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem className="w-full">
            <Button
              variant="ghost"
              className="w-full flex justify-start items-center text-left"
              onClick={() => router.push("/emp/dashboard/shift")}
            >
              <CalendarClock className="mr-2 h-5 w-5" />
              <span>Shift</span>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem className="w-full">
            <Button
              variant="ghost"
              className="w-full flex justify-start items-center text-left"
              onClick={() => router.push("/emp/dashboard/leave")}
            >
              <Caravan className="mr-2 h-5 w-5" />
              <span>Leaves</span>
            </Button>
          </NavigationMenuItem>
          <NavigationMenuItem className="w-full">
            <Button
              variant="ghost"
              className="w-full flex justify-start items-center text-left"
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Logout</span>
            </Button>
          </NavigationMenuItem>
        </NavigationMenu>
      </nav>
    </aside>
  );
};

export default Sidebar;
