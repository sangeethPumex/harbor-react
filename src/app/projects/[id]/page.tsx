"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderGit, GitBranch, Plus } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable, Column } from "@/components/organisms/DataTable/DataTable";

// Interfaces
interface Environment {
  name: string;
  dotColor: "success" | "warning" | "danger" | "info";
  status: "Live" | "Deploying" | "Offline";
  lastDeployTime: string;
  lastCommitMessage: string;
  deployedBy: string;
  branch: string;
  compute: string;
}

interface Deployment {
  id: string;
  environment: string;
  status: "success" | "running" | "failed";
  triggeredBy: string;
  duration: string;
  timestamp: string;
  commitHash: string;
}

// Initial Mock Environment Data matching screenshot 1
const INITIAL_ENVS: Environment[] = [
  {
    name: "production",
    dotColor: "success",
    status: "Live",
    lastDeployTime: "Jun 3, 2026 10:22 AM",
    lastCommitMessage: "#142 — feat: rate limiting",
    deployedBy: "Alex K.",
    branch: "main",
    compute: "ECS",
  },
  {
    name: "staging",
    dotColor: "success",
    status: "Live",
    lastDeployTime: "Jun 3, 2026 08:14 AM",
    lastCommitMessage: "#141 — fix: auth middleware",
    deployedBy: "Priya R.",
    branch: "pre-prod",
    compute: "EC2",
  },
  {
    name: "uat",
    dotColor: "warning",
    status: "Deploying",
    lastDeployTime: "Jun 3, 2026 12:05 PM",
    lastCommitMessage: "#143 — feat: structured logs",
    deployedBy: "Sam T.",
    branch: "feature/logging",
    compute: "EC2",
  },
  {
    name: "dev",
    dotColor: "success",
    status: "Live",
    lastDeployTime: "Jun 3, 2026 11:48 AM",
    lastCommitMessage: "#140 — chore: deps update",
    deployedBy: "Maria G.",
    branch: "develop",
    compute: "EC2",
  },
];

// Initial Mock Deployments matching screenshot 1
const INITIAL_DEPLOYS: Deployment[] = [
  {
    id: "#143",
    environment: "uat",
    status: "running",
    triggeredBy: "Sam T.",
    duration: "1m 22s",
    timestamp: "Jun 3, 2026 12:05 PM",
    commitHash: "a3f9d12",
  },
  {
    id: "#142",
    environment: "production",
    status: "success",
    triggeredBy: "Alex K.",
    duration: "4m 12s",
    timestamp: "Jun 3, 2026 10:22 AM",
    commitHash: "c8e2b71",
  },
  {
    id: "#141",
    environment: "staging",
    status: "success",
    triggeredBy: "Priya R.",
    duration: "3m 01s",
    timestamp: "Jun 2, 2026 11:48 AM",
    commitHash: "7e9f218",
  },
  {
    id: "#140",
    environment: "dev",
    status: "success",
    triggeredBy: "Maria G.",
    duration: "4m 12s",
    timestamp: "Jun 2, 2026 08:14 AM",
    commitHash: "b1d7c44",
  },
  {
    id: "#139",
    environment: "staging",
    status: "failed",
    triggeredBy: "Dev N.",
    duration: "4m 12s",
    timestamp: "Jun 2, 2026 04:30 AM",
    commitHash: "7e9f218",
  },
];

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [envs, setEnvs] = useState<Environment[]>(INITIAL_ENVS);
  const [deploys, setDeploys] = useState<Deployment[]>(INITIAL_DEPLOYS);

  // Format project name nicely
  const projectName = typeof id === "string" ? id : "harbor-api";

  const handleSimulateDeploy = (envName: string) => {
    // 1. Set environment status to Deploying
    setEnvs((prevEnvs) =>
      prevEnvs.map((env) =>
        env.name === envName
          ? { ...env, status: "Deploying", dotColor: "warning" }
          : env
      )
    );

    // 2. Add a new running deployment log
    const newDeployId = `#${144 + Math.floor(Math.random() * 100)}`;
    const newDeploy: Deployment = {
      id: newDeployId,
      environment: envName,
      status: "running",
      triggeredBy: "Admin",
      duration: "0s",
      timestamp: "Just now",
      commitHash: Math.random().toString(16).substring(2, 9),
    };

    setDeploys((prev) => [newDeploy, ...prev]);

    // 3. After 4 seconds, mark deployment as complete / Live
    setTimeout(() => {
      setEnvs((prevEnvs) =>
        prevEnvs.map((env) =>
          env.name === envName
            ? {
                ...env,
                status: "Live",
                dotColor: "success",
                lastDeployTime: new Date().toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }),
                lastCommitMessage: `${newDeployId} — feat: trigger automatic sync`,
                deployedBy: "Admin",
              }
            : env
        )
      );

      setDeploys((prev) =>
        prev.map((d) =>
          d.id === newDeployId
            ? { ...d, status: "success", duration: "18s" }
            : d
        )
      );
    }, 4000);
  };

  // Columns for Environments table
  const envColumns: Column<Environment>[] = [
    {
      header: "Environment",
      accessor: "name",
      className: "w-48",
      renderCell: (row) => (
        <div className="flex items-center gap-2">
          {/* Dot indicator */}
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${
              row.dotColor === "success"
                ? "bg-[#2e7d32]"
                : row.dotColor === "warning"
                ? "bg-[#e65100]"
                : "bg-[#c62828]"
            }`}
          />
          <span className="font-medium text-[#1a1a1a]">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      className: "w-32",
      renderCell: (row) => (
        <Badge
          variant={
            row.status === "Live"
              ? "success"
              : row.status === "Deploying"
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
      header: "Last Deployment",
      accessor: "lastDeployTime",
      renderCell: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-[#2b2622] font-medium">{row.lastDeployTime}</span>
          <span className="text-xs text-[#8a7f75]">
            {row.lastCommitMessage}
          </span>
        </div>
      ),
    },
    {
      header: "Deployed By",
      accessor: "deployedBy",
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
      header: "Compute",
      accessor: "compute",
      renderCell: (row) => (
        <span className="bg-[#e3f2fd] text-[#1565c0] text-[11px] font-medium px-2 py-0.5 rounded-sm border border-[#1565c0]/10">
          {row.compute}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      className: "text-right w-44",
      renderCell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push("/history")}
            width="w-auto"
            className="cursor-pointer"
          >
            View
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={row.status === "Deploying"}
            onClick={() => handleSimulateDeploy(row.name)}
            width="w-auto"
            className="cursor-pointer"
          >
            {row.status === "Deploying" ? "Deploying" : "Deploy"}
          </Button>
        </div>
      ),
    },
  ];

  // Columns for Recent Deployments table
  const deployColumns: Column<Deployment>[] = [
    {
      header: "#",
      accessor: "id",
      className: "w-16 text-[#8a7f75]",
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
              : "danger"
          }
          showDot={false}
          className="capitalize text-xs font-medium rounded-sm px-2 py-0.5"
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
      header: "Commit",
      accessor: "commitHash",
      renderCell: (row) => (
        <span className="bg-[#fdfcf9] text-[#6b5e52] text-xs font-mono font-medium px-2 py-0.5 rounded-sm border border-black/5">
          {row.commitHash}
        </span>
      ),
    },
    {
      header: "",
      accessor: "view" as keyof Deployment,
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
    <AppLayout searchPlaceholder="Search environments...">
      {/* Top Breadcrumb Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-black/5 pb-4 select-none">
        <div>
          <h1 className="text-[22px] font-medium text-[#1a1a1a]">{projectName}</h1>
          <p className="text-sm text-[#6b5e52] mt-1">
            Go backend service for Harbor portal
          </p>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1 bg-white border border-black/5 text-[#6b5e52] text-[11px] font-medium px-2 py-0.5 rounded-sm">
              <FolderGit size={10} className="text-[#8a7f75]" />
              org/harbor-api
            </span>
            <span className="inline-flex items-center gap-1 bg-white border border-black/5 text-[#6b5e52] text-[11px] font-medium px-2 py-0.5 rounded-sm">
              <GitBranch size={10} className="text-[#8a7f75]" />
              main
            </span>
          </div>
        </div>

        <div>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} className="stroke-[3]" />}
            width="w-auto"
            className="cursor-pointer"
          >
            Add Environment
          </Button>
        </div>
      </div>

      {/* Environments Header Section */}
      <div className="flex items-center justify-between mb-3 select-none">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#1a1a1a]">
            Environments
          </h2>
          <span className="text-xs bg-[#e8f5e9] text-[#2e7d32] font-medium px-2 py-0.5 rounded-sm">
            {envs.length} total &bull; {envs.filter(e => e.status !== "Offline").length} healthy
          </span>
        </div>
      </div>

      {/* Environments Table */}
      <div className="mb-8">
        <DataTable columns={envColumns} data={envs} pageSize={10} />
      </div>

      {/* Recent Deployments Header Section */}
      <div className="flex items-center justify-between mb-3 select-none">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">
          Recent Deployments
        </h2>
      </div>

      {/* Recent Deployments Table */}
      <div>
        <DataTable columns={deployColumns} data={deploys} pageSize={5} />
      </div>
    </AppLayout>
  );
}
