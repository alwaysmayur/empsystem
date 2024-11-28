"use client";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { useUser } from "@/app//context/UseContex";
import { useEffect, useState } from "react";
export function CustomSidebarContent() {
  const user: any = useUser();

  const [projects, setProjects] = useState<
    Array<{ name: string; url: string; icon: any }>
  >([]);
  useEffect(() => {
    if (user?.role == "admin" || user?.role == "hr") {
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
        }
      ]);
    }
  }, [user]);
 
  return (
    <SidebarContent>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarMenu>
          {projects.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" side="bottom" align="end">
                  <DropdownMenuItem>
                    <Folder className="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </SidebarMenuItem>
          ))}
          {/* <SidebarMenuItem>
            <SidebarMenuButton>
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  );
}
