"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Calendar } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable, Column } from "@/components/organisms/DataTable/DataTable";
import { Tabs, TabData } from "@/components/atoms/Tabs/Tabs";

// Deployment History Interface
interface HistoryDeployment {
  id: string;
  project: string;
  environment: string;
  status: "running" | "success" | "failed" | "stopped" | "pending";
  triggeredBy: string;
  duration: string;
  timestamp: string;
  commitHash: string;
  branch: string;
}

// Complete mock dataset replicating Image 2
const HISTORY_DATA: HistoryDeployment[] = [
  {
    id: "#149",
    project: "island-api",
    environment: "production",
    status: "running",
    triggeredBy: "Taylor B.",
    duration: "9m 05s",
    timestamp: "Jun 3, 2026 1:25 PM",
    commitHash: "j7f4b56",
    branch: "feature/integration",
  },
  {
    id: "#148",
    project: "lake-service",
    environment: "staging",
    status: "pending",
    triggeredBy: "Jamie C.",
    duration: "8m 15s",
    timestamp: "Jun 3, 2026 1:15 PM",
    commitHash: "i6e3f43",
    branch: "bugfix/accessibility",
  },
  {
    id: "#147",
    project: "forest-api",
    environment: "dev",
    status: "running",
    triggeredBy: "Morgan T.",
    duration: "7m 20s",
    timestamp: "Jun 3, 2026 1:05 PM",
    commitHash: "h5d1b89",
    branch: "feature/user-interface",
  },
  {
    id: "#146",
    project: "desert-service",
    environment: "uat",
    status: "stopped",
    triggeredBy: "Taylor A.",
    duration: "6m 50s",
    timestamp: "Jun 3, 2026 12:55 PM",
    commitHash: "g4f0d67",
    branch: "feature/security",
  },
  {
    id: "#145",
    project: "river-api",
    environment: "production",
    status: "running",
    triggeredBy: "Jordan M.",
    duration: "4m 45s",
    timestamp: "Jun 3, 2026 12:45 PM",
    commitHash: "f3b8c22",
    branch: "bugfix/performance",
  },
  {
    id: "#144",
    project: "mountain-service",
    environment: "staging",
    status: "pending",
    triggeredBy: "Chris L.",
    duration: "5m 30s",
    timestamp: "Jun 3, 2026 12:35 PM",
    commitHash: "d6e2a12",
    branch: "feature/analytics",
  },
  {
    id: "#143",
    project: "sky-api",
    environment: "dev",
    status: "running",
    triggeredBy: "Alex R.",
    duration: "2m 10s",
    timestamp: "Jun 3, 2026 12:25 PM",
    commitHash: "c8d7b34",
    branch: "feature/optimization",
  },
  {
    id: "#142",
    project: "ocean-service",
    environment: "production",
    status: "stopped",
    triggeredBy: "Jenna K.",
    duration: "3m 15s",
    timestamp: "Jun 3, 2026 12:15 PM",
    commitHash: "b2e4f75",
    branch: "bugfix/timeout",
  },
  {
    id: "#141",
    project: "harbor-api",
    environment: "production",
    status: "running",
    triggeredBy: "Alex K.",
    duration: "4m 12s",
    timestamp: "Jun 3, 2026 12:05 PM",
    commitHash: "c8eb2b7",
    branch: "main",
  },
  {
    id: "#139",
    project: "harbor-api",
    environment: "uat",
    status: "running",
    triggeredBy: "Sam T.",
    duration: "1m 22s",
    timestamp: "Jun 3, 2026 12:05 PM",
    commitHash: "a3f9d12",
    branch: "feature/logging",
  },
];

type StatusFilter = "all" | "success" | "failed" | "running";

const STATUS_TABS: TabData[] = [
  ["all", "All"],
  ["success", "Success"],
  ["failed", "Failed"],
  ["running", "Running"],
];

export default function HistoryPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [envFilter, setEnvFilter] = useState("all");
  const [dateVal, setDateVal] = useState("24-03-2026");

  // Filter columns options dynamically
  const uniqueProjects = Array.from(new Set(HISTORY_DATA.map((d) => d.project)));
  const uniqueEnvs = Array.from(new Set(HISTORY_DATA.map((d) => d.environment)));

  // Filter logic
  const filteredData = HISTORY_DATA.filter((row) => {
    // Project filter
    if (projectFilter !== "all" && row.project !== projectFilter) return false;

    // Environment filter
    if (envFilter !== "all" && row.environment !== envFilter) return false;

    // Status filter
    if (statusFilter === "success" && row.status !== "success") return false;
    if (statusFilter === "failed" && row.status !== "failed" && row.status !== "stopped") return false;
    if (statusFilter === "running" && row.status !== "running" && row.status !== "pending") return false;

    return true;
  });

  const columns: Column<HistoryDeployment>[] = [
    {
      header: "#",
      accessor: "id",
      className: "w-16 text-[#8a7f75]",
    },
    {
      header: "Project",
      accessor: "project",
      className: "font-medium text-[#1a1a1a]",
    },
    {
      header: "Environment",
      accessor: "environment",
      renderCell: (row) => (
        <span
          className={`font-medium ${
            row.environment === "production"
              ? "text-[#d08873]"
              : row.environment === "uat"
              ? "text-[#e65100]"
              : "text-[#2b2622]"
          }`}
        >
          {row.environment}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      renderCell: (row) => (
        <Badge
          variant={
            row.status === "success"
              ? "success"
              : row.status === "running"
              ? "warning"
              : row.status === "pending"
              ? "warning"
              : "danger"
          }
          showDot={false}
          className="text-xs font-medium rounded-sm px-2 py-0.5"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Triggered By",
      accessor: "triggeredBy",
    },
    {
      header: "Duration",
      accessor: "duration",
    },
    {
      header: "Timestamp",
      accessor: "timestamp",
    },
    {
      header: "PR / Commit",
      accessor: "commitHash",
      renderCell: (row) => (
        <span className="bg-[#fdfcf9] text-[#6b5e52] text-xs font-mono font-medium px-2 py-0.5 rounded-sm border border-black/5">
          {row.commitHash}
        </span>
      ),
    },
    {
      header: "Branch",
      accessor: "branch",
      renderCell: (row) => (
        <span className="bg-[#fdfcf9] text-[#6b5e52] text-[11px] font-medium px-2 py-0.5 rounded-sm border border-black/5">
          {row.branch}
        </span>
      ),
    },
    {
      header: "",
      accessor: "actions",
      className: "text-right w-20",
      renderCell: (row) => (
        <Button
          size="sm"
          variant="secondary"
          width="w-auto"
          className="cursor-pointer"
          onClick={() => router.push(`/deployments/${row.id.replace("#", "")}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <AppLayout searchPlaceholder="Search deployments...">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-5 select-none">
        <div>
          <h1 className="text-[22px] font-medium text-[#1a1a1a]">
            Deployment History
          </h1>
          <p className="text-xs text-[#8a7f75] mt-1">
            All deployments across all projects and environments
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={<Download size={14} />}
          width="w-auto"
          className="cursor-pointer"
        >
          Export CSV
        </Button>
      </div>

      {/* Local Filter Panels */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-black/5 rounded-md p-3 mb-5 select-none">
        {/* Status Sub-Filters */}
        <Tabs
          data={STATUS_TABS}
          activeTab={statusFilter}
          setActiveTab={(val) => setStatusFilter(val as StatusFilter)}
        />

        {/* Dropdowns Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Projects Select */}
          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="appearance-none bg-white border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer"
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Environments Select */}
          <div className="relative">
            <select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="appearance-none bg-white border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer"
            >
              <option value="all">All Environments</option>
              {uniqueEnvs.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Date Picker Field */}
          <div className="relative flex items-center bg-white border border-black/5 rounded-md px-3 py-2 text-sm text-[#2b2622]">
            <Calendar size={13} className="text-[#8a7f75] shrink-0 mr-2" />
            <input
              type="text"
              value={dateVal}
              onChange={(e) => setDateVal(e.target.value)}
              className="bg-transparent focus:outline-none w-24"
              placeholder="DD-MM-YYYY"
            />
          </div>
        </div>
      </div>

      {/* Main Table logs */}
      <div>
        <DataTable columns={columns} data={filteredData} pageSize={10} />
      </div>
    </AppLayout>
  );
}
