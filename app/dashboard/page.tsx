"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button"; // Adjust the import based on your structure

import { Check, X } from "lucide-react"; // Icons
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Shadcn table components
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import DashboardStats from "@/components/dashboard/dashboardStats";
import LeaveListPage from "@/components/dashboard/leaveListPage";
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

import ShiftListPage from "@/components/dashboard/shiftListPage";
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
  const [leaveChartData, setLeaveChartData] = useState<any>();

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
      .then((res) => {
        setLeaveData(res.data.leaveRequests);
        setLeaveChartData(res.data.chartData);
      })
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
          // Group employees by single month
          const groupedData = employees.reduce((acc: any, employee: any) => {
            const createdAt = new Date(employee.createdAt);
            const month = createdAt.getMonth(); // 0-based index for month
            const year = createdAt.getFullYear();
            const key = `${month}-${year}`;

            if (!acc[key]) {
              acc[key] = 0;
            }

            acc[key]++;
            return acc;
          }, {});

          // Convert data to format for the chart
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          const labels = Object.keys(groupedData).map((key) => {
            const [month, year] = key.split("-");
            return `${monthNames[parseInt(month)]} ${year}`; // Month name + year
          });

          const counts = Object.values(groupedData); // [5, 10, ...]

          setChartData({
            labels,
            datasets: [
              {
                label: "Employee Count",
                data: counts,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: "start", // Fill under the line
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

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Employee Count by Month",
      },
      filler: {
        propagate: false,
      },
    },
    interaction: {
      intersect: false,
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
          leaveChartData?.filter((leave) => leave.status === "Approved").length,
          leaveChartData?.filter((leave) => leave.status === "Pending").length,
          leaveChartData?.filter((leave) => leave.status === "Rejected").length,
        ],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
      },
    ],
  };

  const barChartData = {
    labels: employeeData
      .filter((emp: any) => emp.role !== "admin")
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

  return chartData && pieChartData ? (
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
      
      {/* {user?.role !== "admin" && user?.role !== "hr" ? (
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
        </div>
      ) : (
        ""
      )} */}

      {user?.role == "admin" || user?.role == "hr" ? (
        <div className="p-6 gap-2 w-full justify-center flex-col">
          <div className="flex  gap-12 ">
            <Card className="flex w-full flex-col items-center content-center justify-center">
              <CardHeader>Employees</CardHeader>
              <CardContent style={{ width: "580px", height: "300px" }}>
                {chartData && <Line data={chartData} options={options} />}
              </CardContent>
            </Card>

            <Card className="flex w-full flex-col items-center content-center justify-center">
              <CardHeader>Leave Status of December</CardHeader>
              <CardContent>
                <Pie
                  style={{ width: "280px", height: "300px" }}
                  data={pieChartData}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        ""
      )}

      <div className="flex flex-col w-full p-4 pt-0">
        <>
          {user?.role !== "admin" && user?.role !== "hr" ? (
            <ShiftListPage isOffeShift={false} />
          ) : null}
          <div className="flex">
            <LeaveListPage pieChartData={pieChartData} />
            <div className="flex w-1/3 mt-20 h-auto gap-4 p-4 pt-0">
              {employeeData ? <ShiftListPage isOffeShift={true} /> : null}
            </div>
          </div>
        </>
      </div>
    </>
  ) : (
    <div className="flex justify-center items-center content-center w-[90%] h-screen">
      <div className="w-10 h-10 border-4 border-t-gray-500 border-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};

export default Dashboard;
