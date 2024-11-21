"use client";

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

// pages/dashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Assuming Shadcn UI components
import moment from "moment";

// Register Chart.js elements
ChartJS.register(
  ArcElement, // For Pie/Donut charts
  Tooltip,
  Legend,
  CategoryScale, // For axis scales
  LinearScale,
  BarElement, // For Bar charts
  PointElement,
  LineElement // For Line/Area charts
);

// Types for the data fetched
interface LeaveRequest {
  status: "Approved" | "Pending" | "Rejected";
}

interface Employee {
  _id: string;
  name: string;
}

interface Shift {
  employeeId: string;
  shiftDate: string;
  duration: number;
  role: "Food Packer" | "Cashier" | "Kitchen"; // Assuming roles are Food Packer, Cashier, and Kitchen
}

const Dashboard: React.FC = () => {
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [shiftData, setShiftData] = useState<Shift[]>([]);
  const [employeeData, setEmployeeData] = useState<Employee[]>([]);
  const [user, setUser] = useState<any>();
  const [header, setHeader] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [states, setStates] = useState<StatItem[]>([]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user/me");
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const { role } = data.user.employee;
      const { employeeStates, shiftsStates, leavesStates } = data.user;

      setUser(data.user.employee);
      setHeader("Welcome to Employee Management system");

      setStates(
        role === "admin" || role === "hr"
          ? []
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

  useEffect(() => {
    // Fetch Leave Data
    axios
      .post("/api/list/leave", { employee_id: "all" })
      .then((res) => setLeaveData(res.data.leaveRequests))
      .catch((err) => console.error(err));

    // Fetch Shift Data
    axios
      .post("/api/list/shift", { startDate: new Date().toISOString() })
      .then((res) => setShiftData(res.data.shifts))
      .catch((err) => console.error(err));
  }, []);

  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch("/api/list/employee");
        const { employees, status } = await response.json();
        setEmployeeData(employees);

        if (status === 200) {
          // Group employees by month-year in the frontend
          const groupedData = employees.reduce((acc: any, employee: any) => {
            const createdAt = new Date(employee.createdAt);
            const monthYear = `${
              createdAt.getMonth() + 1
            }-${createdAt.getFullYear()}`;

            if (!acc[monthYear]) {
              acc[monthYear] = 0;
            }

            acc[monthYear]++;
            return acc;
          }, {});

          const labels = Object.keys(groupedData);
          const counts = Object.values(groupedData);

          setChartData({
            labels,
            datasets: [
              {
                label: "Employee Count",
                data: counts,
                backgroundColor: "rgba(75, 192, 192, 0.5)",
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeData();
  }, []);

  // if (!chartData) return <div>Loading...</div>;

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Monthly Employee Count" },
    },
  };

  // Helper function to get a color based on the role
  const getColorForRole = (role: string) => {
    switch (role) {
      case "Food Packer":
        return "#FF5733"; // Red for Food Packer
      case "Cashier":
        return "#33FF57"; // Green for Cashier
      case "Kitchen":
        return "#3357FF"; // Blue for Kitchen
      default:
        return "#CCCCCC"; // Default color
    }
  };

  // Prepare pie chart data based on leave status counts
  const pieChartData = {
    labels: ["Leaves Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [
          leaveData.filter((leave) => leave.status === "Approved").length,
          leaveData.filter((leave) => leave.status === "Pending").length,
          leaveData.filter((leave) => leave.status === "Rejected").length,
        ],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
      },
    ],
  };

  const barChartData = {
    labels: employeeData
      .filter((emp: any) => emp.role !== "admin") // Exclude admin
      .map((emp) => emp.name),
    datasets: ["Food Packer", "Cashier", "Kitchen"].map((role) => ({
      label: role,
      data: employeeData
        .filter((emp: any) => emp.role !== "admin") // Exclude admin
        .map((emp: any) => {
          const employeeShifts = shiftData.filter(
            (shift: any) => shift.employeeId._id === emp._id // Match employee ID correctly
          );
          return employeeShifts.filter(
            (shift: any) => emp.jobRole.toLowerCase() === role.toLowerCase() // Match job role correctly
          ).length;
        }),
      backgroundColor: getColorForRole(role),
    })),
  };

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
      <div className="mx-6">
        <DashboardStats
          header={header}
          description={description}
          stats={states}
        />
        {user?.role !== "admin" && user?.role !== "hr" ? (
          <div className="flex pt-5 justify-center">
            <img src="/team.svg" className="w-96" alt="" />
          </div>
        ) : null}
        {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
      </div>

      {user?.role == "admin" || user?.role == "hr" ? (
        <div className="p-6 gap-2 w-full justify-center flex-col">
          <div className="flex  gap-12 ">
            <Card className="flex w-full flex-col items-center content-center justify-center">
              <CardHeader>Leave Status</CardHeader>
              <CardContent>
                <Pie data={pieChartData} />
              </CardContent>
            </Card>

            <Card className="flex w-full flex-col items-center content-center justify-center">
              <CardHeader>Employees</CardHeader>
              <CardContent style={{ width: "380px", height: "300px" }}>
                {chartData && <Bar options={options} data={chartData} />}
              </CardContent>
            </Card>
            <Card className="flex w-full flex-col  items-center content-center justify-center">
              <CardHeader>Shifts Per Employee</CardHeader>
              <CardContent style={{ width: "380px", height: "300px" }}>
                <Bar
                  data={barChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: "Shifts Assigned by Role",
                      },
                    },
                    scales: {
                      x: {
                        stacked: true,
                      },
                      y: {
                        stacked: true,
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Dashboard;
