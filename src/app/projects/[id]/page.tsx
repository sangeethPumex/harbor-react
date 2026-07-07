"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { FolderGit, GitBranch, Plus, RefreshCw } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable, Column } from "@/components/organisms/DataTable/DataTable";
import { projectService } from "@/services/project_service";
import { useToast } from "@/components/atoms/Toast/Toast";
import { CreateEnvironmentModal } from "@/components/organisms/CreateEnvironmentModal/CreateEnvironmentModal";

interface EnvironmentDetailItem {
  branchName: string;
  environmentName: string;
  status: string;
  lastDeployment: string;
  deployedBy: string;
  compute: string | null;
}

interface RecentDeploymentItem {
  number: number;
  environment: string;
  status: string;
  triggeredBy: string;
  duration: string;
  timestamp: string;
  commitID: string;
}

interface ProjectDetailsResponse {
  projectName: string;
  projectDescription: string;
  githubdata: string;
  environments: EnvironmentDetailItem[];
  recentDeployments: RecentDeploymentItem[];
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="flex flex-col gap-0 animate-pulse">
      <div className="flex gap-4 pb-3 border-b border-black/5">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-2.5 bg-[#ede7e0] rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-black/5 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-[#ede7e0] rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function envStatusVariant(status: string): "success" | "warning" | "danger" {
  const s = status.toLowerCase();
  if (s === "active" || s === "live") return "success";
  if (s === "deploying" || s === "running" || s === "in_progress") return "warning";
  return "danger";
}

function envStatusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === "active") return "Live";
  if (s === "in_progress") return "Deploying";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function deployStatusVariant(status: string): "success" | "warning" | "danger" {
  const s = status.toLowerCase();
  if (s === "success") return "success";
  if (s === "in_progress" || s === "queued" || s === "waiting") return "warning";
  return "danger";
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const projectId = typeof id === "string" ? id : "";

  const [data, setData] = useState<ProjectDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddEnvOpen, setIsAddEnvOpen] = useState(false);

  const fetchDetails = useCallback(
    async (silent = false) => {
      if (!projectId) return;
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);
      try {
        const res: ProjectDetailsResponse = await projectService.getProjectDetails(projectId);
        setData(res);
      } catch (err: any) {
        const msg = err.response?.data?.error || err.message || "Failed to load project details";
        toast(msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const projectName = data?.projectName || (typeof id === "string" ? id : "Project");
  const projectDescription = data?.projectDescription ?? "";
  const githubParts = (data?.githubdata ?? "").split("/");
  const githubOrg = githubParts[0] ?? "";
  const githubRepo = githubParts[1] ?? "";
  const envs = data?.environments ?? [];
  const deploys = data?.recentDeployments ?? [];
  const healthyCount = envs.filter(
    (e) => e.status.toLowerCase() === "active" || e.status.toLowerCase() === "live"
  ).length;

  const envColumns: Column<EnvironmentDetailItem>[] = [
    {
      header: "Environment",
      accessor: "environmentName",
      className: "w-44",
      renderCell: (row) => {
        const variant = envStatusVariant(row.status);
        const dotColor =
          variant === "success" ? "bg-[#2e7d32]"
          : variant === "warning" ? "bg-[#e65100]"
          : "bg-[#c62828]";
        return (
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
            <span className="font-medium text-[#1a1a1a]">{row.environmentName}</span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      className: "w-28",
      renderCell: (row) => (
        <Badge variant={envStatusVariant(row.status)} showDot={false} className="text-xs font-medium rounded-sm px-2 py-0.5">
          {envStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      header: "Last Deployment",
      accessor: "lastDeployment",
      renderCell: (row) => (
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-[#2b2622] font-medium">{row.lastDeployment}</span>
          {row.deployedBy && <span className="text-xs text-[#8a7f75]">by {row.deployedBy}</span>}
        </div>
      ),
    },
    {
      header: "Deployed By",
      accessor: "deployedBy",
      renderCell: (row) => <span className="text-sm text-[#6b5e52]">{row.deployedBy || "—"}</span>,
    },
    {
      header: "Branch",
      accessor: "branchName",
      renderCell: (row) => (
        <span className="bg-[#fdfcf9] text-[#6b5e52] text-[11px] font-medium px-2 py-0.5 rounded-sm border border-black/5">
          {row.branchName || "—"}
        </span>
      ),
    },
    {
      header: "Compute",
      accessor: "compute",
      renderCell: (row) =>
        row.compute ? (
          <span className="bg-[#e3f2fd] text-[#1565c0] text-[11px] font-medium px-2 py-0.5 rounded-sm border border-[#1565c0]/10">
            {row.compute}
          </span>
        ) : (
          <span className="text-[11px] text-[#aaa]">—</span>
        ),
    },
    {
      header: "Actions",
      accessor: "environmentName" as keyof EnvironmentDetailItem,
      className: "text-right w-24",
      renderCell: (row) => (
        <div className="flex items-center justify-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push(`/projects/${projectId}/environments/${row.environmentName}`)}
            width="w-auto"
            className="cursor-pointer"
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const deployColumns: Column<RecentDeploymentItem>[] = [
    {
      header: "#",
      accessor: "number",
      className: "w-16",
      renderCell: (row) => <span className="text-[#8a7f75]">#{row.number}</span>,
    },
    {
      header: "Environment",
      accessor: "environment",
      renderCell: (row) => (
        <span className={`font-medium ${
          row.environment.toLowerCase() === "production" ? "text-[#d08873]"
          : row.environment.toLowerCase() === "uat" ? "text-[#e65100]"
          : "text-[#2b2622]"
        }`}>
          {row.environment}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      renderCell: (row) => (
        <Badge variant={deployStatusVariant(row.status)} showDot={false} className="capitalize text-xs font-medium rounded-sm px-2 py-0.5">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Triggered By",
      accessor: "triggeredBy",
      renderCell: (row) => <span className="text-sm text-[#6b5e52]">{row.triggeredBy || "—"}</span>,
    },
    {
      header: "Duration",
      accessor: "duration",
      renderCell: (row) => <span className="text-sm text-[#6b5e52]">{row.duration || "—"}</span>,
    },
    {
      header: "Timestamp",
      accessor: "timestamp",
      renderCell: (row) => <span className="text-sm text-[#6b5e52]">{row.timestamp || "—"}</span>,
    },
    {
      header: "Commit",
      accessor: "commitID",
      renderCell: (row) => (
        <span className="bg-[#fdfcf9] text-[#6b5e52] text-xs font-mono font-medium px-2 py-0.5 rounded-sm border border-black/5">
          {row.commitID || "—"}
        </span>
      ),
    },
  ];

  return (
    <AppLayout searchPlaceholder="Search environments...">
      {/* Top heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border-b border-black/5 pb-4 select-none">
        <div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 w-52 bg-[#ede7e0] rounded mb-2" />
              <div className="h-3.5 w-80 bg-[#ede7e0] rounded mb-1" />
              <div className="flex gap-2 mt-3">
                <div className="h-5 w-28 bg-[#ede7e0] rounded-sm" />
                <div className="h-5 w-20 bg-[#ede7e0] rounded-sm" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-medium text-[#1a1a1a]">{projectName}</h1>
              {projectDescription && <p className="text-sm text-[#6b5e52] mt-1">{projectDescription}</p>}
              <div className="flex items-center gap-3 mt-3">
                {githubOrg && githubRepo && (
                  <span className="inline-flex items-center gap-1 bg-white border border-black/5 text-[#6b5e52] text-[11px] font-medium px-2 py-0.5 rounded-sm">
                    <FolderGit size={10} className="text-[#8a7f75]" />
                    {githubOrg}/{githubRepo}
                  </span>
                )}
                {envs[0]?.branchName && (
                  <span className="inline-flex items-center gap-1 bg-white border border-black/5 text-[#6b5e52] text-[11px] font-medium px-2 py-0.5 rounded-sm">
                    <GitBranch size={10} className="text-[#8a7f75]" />
                    {envs[0].branchName}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />}
            width="w-auto"
            className="cursor-pointer border border-black/5"
            onClick={() => fetchDetails(true)}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} className="stroke-[3]" />}
            width="w-auto"
            className="cursor-pointer"
            onClick={() => setIsAddEnvOpen(true)}
          >
            Add Environment
          </Button>
        </div>
      </div>

      {/* Environments */}
      <div className="flex items-center gap-2 mb-3 select-none">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">Environments</h2>
        {!isLoading && (
          <span className="text-xs bg-[#e8f5e9] text-[#2e7d32] font-medium px-2 py-0.5 rounded-sm">
            {envs.length} total &bull; {healthyCount} healthy
          </span>
        )}
      </div>

      <div className="mb-8">
        {isLoading ? (
          <TableSkeleton rows={4} cols={7} />
        ) : (
          <DataTable columns={envColumns} data={envs} pageSize={10} emptyStateText="No environments configured for this project" />
        )}
      </div>

      {/* Recent Deployments */}
      <div className="mb-3 select-none">
        <h2 className="text-sm font-semibold text-[#1a1a1a]">Recent Deployments</h2>
      </div>

      <div>
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : (
          <DataTable columns={deployColumns} data={deploys} pageSize={10} emptyStateText="No deployments found" />
        )}
      </div>

      <CreateEnvironmentModal
        isOpen={isAddEnvOpen}
        onClose={() => setIsAddEnvOpen(false)}
        projectId={projectId}
        githubRepo={githubRepo}
        onCreated={() => fetchDetails(false)}
      />
    </AppLayout>
  );
}