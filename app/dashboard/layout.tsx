// RootLayout.tsx

import { CustomSidebarContent } from "@/components/auth/customeSidebarContent";
import { CustomSidebarFooter } from "@/components/auth/customeSidebarFooter";
import { CustomSidebarHeader } from "@/components/auth/customeSidebarHeader";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";

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
  
  const data = {
    user: {
      name: "HR",
      email: "hr@gmail.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
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
    ],
  };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <CustomSidebarHeader />
        <CustomSidebarContent projects={data.projects} />
        <CustomSidebarFooter user={data.user} />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
