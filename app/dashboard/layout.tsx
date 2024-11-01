// RootLayout.tsx
"use client";
import { CustomSidebarContent } from "@/components/auth/customeSidebarContent";
import { CustomSidebarFooter } from "@/components/auth/customeSidebarFooter";
import { CustomSidebarHeader } from "@/components/auth/customeSidebarHeader";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

import {
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Frame,
  LifeBuoy,
  LogOut,
  Map,
  MoreHorizontal,
  PieChart,
  Send,
  Settings2,
  Share,
  Sparkles,
  SquareTerminal,
  Trash2,
  CalendarClock,
  Caravan,
  Clock,
  CircleGauge,
  UserRoundPlus,
  User,
  LayoutDashboard,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState();
  const [projects, setProjects] = useState<
    Array<{ name: string; url: string; icon: any }>
  >([]);
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setUser(data.user.employee);
      if (
        data.user.employee.role == "admin" ||
        data.user.employee.role == "hr"
      ) {
        setProjects([
          {
            name: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Employees",
            url: "/dashboard/employees",
            icon: UserRoundPlus,
          },
          {
            name: "Shifts",
            url: "/dashboard/shifts",
            icon: Clock,
          },
          {
            name: "Leaves",
            url: "/dashboard/leaves",
            icon: Caravan,
          },
        ]);
      } else {
        setProjects([
          {
            name: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Shifts",
            url: "/dashboard/shifts",
            icon: Clock,
          },
          {
            name: "Leaves",
            url: "/dashboard/leaves",
            icon: Caravan,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  console.log("data", user);

  return user ? (
    <SidebarProvider>
      <Sidebar variant="inset">
        <CustomSidebarHeader />
        <CustomSidebarContent projects={projects} />
        <CustomSidebarFooter user={user} />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  ) : (
    ""
  );
}
