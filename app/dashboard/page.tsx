"use client";

import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import DashboardStats from "@/components/dashboard/dashboardStats";
interface StatItem {
  label: string;
  value: number;
}

export default function Page() {
  const [user, setUser] = useState();
  const [header, setHeader] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [states, setStates] = useState<StatItem[]>([]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const { role } =data.user.employee;
      const {employeeStates, shiftsStates, leavesStates } =data.user;

      setUser(data.user.employee);
      setHeader("Welcome to Employee Management system");

      setStates(
        role === "admin" || role === "hr"
          ? [
              { label: "Total Employees", value: employeeStates },
              { label: "Total Shifts", value: shiftsStates },
              { label: "Total Leaves Applied", value: leavesStates },
            ]
          : [
              { label: "Total Shifts", value: shiftsStates },
              { label: "Total Leaves Applied", value: leavesStates },
            ]
      );

      setDescription(
        role === "admin" || role === "hr"
          ? "Manage the employees and their shifts easily with ShiftTrack."
          : "Balance your shift, make work manageable, and enjoy every moment."
      );
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              {/* <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem> */}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1  flex-col gap-4 p-4 pt-0">
        <DashboardStats
          header={header}
          description={description}
          stats={states}
        />
        <div className="flex pt-5 justify-center">
          <img src="/team.svg" className="w-96" alt="" />
        </div>
        {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
      </div>
    </>
  );
}
