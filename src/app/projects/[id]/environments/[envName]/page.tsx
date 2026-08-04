"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, RotateCcw, History, ArrowRight, AlertCircle, Terminal } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable, Column } from "@/components/organisms/DataTable/DataTable";
import { projectService } from "@/services/project_service";

interface DeploymentHistoryItem {
  timestamp: string;
  deployer: string;
  prTitle: string;
  duration: string;
  outcome: "success" | "failed";
}

interface ECSDetails {
  hasECS: boolean;
  status: string;
  runningTasks: string;
  taskDefinition: string;
  dockerImage: string;
}

interface ALBDetails {
  hasALB: boolean;
  name: string;
  requestCount: string;
  latency: string;
  errorRate5xx: string;
}

interface RDSDetails {
  hasRDS: boolean;
  connections: string;
  cpuUtilization: string;
  storageGB: string;
}

interface S3Details {
  hasS3: boolean;
  totalObjects: string;
  storageTotal: string;
  lastModified: string;
}

interface SQSDetails {
  hasSQS: boolean;
  visibleMsgs: string;
  inFlightMsgs: string;
}

interface CloudWatchLogLine {
  timestamp: string;
  level: string;
  message: string;
}

interface DeploymentSummaryDetails {
  prTitle: string;
  prLink: string;
  author: string;
  commitID: string;
  filesChanged: string;
  additions: string;
  deletions: string;
  duration: string;
}

interface PullRequestContextDetails {
  prNumber: string;
  title: string;
  author: string;
  status: string;
  branch: string;
  filesChanged: string;
  additions: string;
  deletions: string;
  linkedIssues: string[];
}

interface ProjectEnvironmentDetailsResponse {
  ecs: ECSDetails;
  alb: ALBDetails;
  rds: RDSDetails;
  s3: S3Details;
  sqs: SQSDetails;
  cloudWatchLogs: CloudWatchLogLine[];
  deploymentSummary: DeploymentSummaryDetails;
  deploymentHistory: DeploymentHistoryItem[];
  pullRequestContext: PullRequestContextDetails;
}

function PageSkeleton() {
  return (
    <AppLayout searchPlaceholder="Search environment metrics...">
      <div className="flex flex-col gap-5 animate-pulse">
        <div className="h-10 bg-[#ede7e0] rounded w-1/3 mb-5"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="h-64 bg-[#ede7e0] rounded"></div>
            <div className="h-64 bg-[#ede7e0] rounded"></div>
            <div className="h-48 bg-[#ede7e0] rounded"></div>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-5">
            <div className="h-48 bg-[#ede7e0] rounded"></div>
            <div className="h-64 bg-[#ede7e0] rounded"></div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function EnvironmentDetailPage() {
  const { id: projectId, envName } = useParams();
  const router = useRouter();

  const [envData, setEnvData] = useState<ProjectEnvironmentDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"Live" | "Deploying">("Live");

  const formattedProjName = typeof projectId === "string" ? projectId : "harbor-api";
  const formattedEnvName = typeof envName === "string" ? envName : "production";

  useEffect(() => {
    const fetchEnvData = async () => {
      try {
        setIsLoading(true);
        const data = await projectService.getEnvironmentDetails(formattedProjName, formattedEnvName);
        setEnvData(data);
      } catch (err) {
        console.error("Failed to fetch environment details", err);
        setError("Failed to load environment details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnvData();
  }, [formattedProjName, formattedEnvName]);

  const handleTriggerDeploy = () => {
    setStatus("Deploying");
    
    // Simulate redirection to deployment logs after 1 second
    setTimeout(() => {
      router.push(`/deployments/143`);
    }, 1500);
  };

  const handleRollback = () => {
    if (confirm("Are you sure you want to rollback to the last successful deployment?")) {
      setStatus("Deploying");
      setTimeout(() => {
        router.push(`/deployments/142`);
      }, 1500);
    }
  };

  const historyColumns: Column<DeploymentHistoryItem>[] = [
    {
      header: "Timestamp",
      accessor: "timestamp",
      className: "w-40",
    },
    {
      header: "Deployer",
      accessor: "deployer",
      className: "w-32",
    },
    {
      header: "PR Title",
      accessor: "prTitle",
      renderCell: (row) => (
        <span className="text-sm text-[#d08873] font-medium hover:underline cursor-pointer">
          {row.prTitle}
        </span>
      ),
    },
    {
      header: "Duration",
      accessor: "duration",
      className: "w-32",
    },
    {
      header: "Outcome",
      accessor: "outcome",
      className: "w-32",
      renderCell: (row) => (
        <Badge
          variant={row.outcome === "success" ? "success" : "danger"}
          showDot={false}
          className="text-xs font-medium rounded-sm px-2 py-0.5"
        >
          {row.outcome}
        </Badge>
      ),
    },
  ];

  if (isLoading || !envData) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <AppLayout searchPlaceholder="Search environment metrics...">
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <AlertCircle size={32} className="mb-2" />
          <p>{error}</p>
        </div>
      </AppLayout>
    );
  }

  const {
    ecs,
    alb,
    rds,
    s3,
    sqs,
    cloudWatchLogs,
    deploymentSummary,
    deploymentHistory,
    pullRequestContext
  } = envData;

  return (
    <AppLayout searchPlaceholder="Search environment metrics...">
      {/* Top Banner Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-4 border-b border-black/5 select-none animate-fade-in">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-medium text-[#1a1a1a] capitalize">{formattedEnvName}</h1>
            <Badge
              variant={status === "Live" ? "success" : "warning"}
              className="text-xs px-2 py-0.5 rounded-sm"
              showDot={false}
            >
              {status === "Live" ? "Live" : "Deploying"}
            </Badge>
          </div>
          <p className="text-sm text-[#6b5e52] mt-1">
            Last deployed {deploymentSummary.duration} ago &bull; by {deploymentSummary.author} &bull; {deploymentSummary.prTitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            icon={<Play size={12} className="fill-current" />}
            onClick={handleTriggerDeploy}
            disabled={status === "Deploying"}
            width="w-auto"
            className="cursor-pointer"
          >
            {status === "Deploying" ? "Deploying..." : "Trigger Deploy"}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={<RotateCcw size={12} />}
            onClick={handleRollback}
            disabled={status === "Deploying"}
            width="w-auto"
            className="cursor-pointer border border-black/5 text-[#3f372f] hover:bg-[#faf9f8]"
          >
            Rollback
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={<History size={12} />}
            onClick={() => router.push("/history")}
            width="w-auto"
            className="cursor-pointer border border-black/5 text-[#3f372f] hover:bg-[#faf9f8]"
          >
            History
          </Button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 select-none animate-slide-up">
        {/* Left Column: Compute Stats, Logs, Summaries, History */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Compute grid panel */}
          {ecs.hasECS && (
            <div className="bg-white border border-black/5 rounded-md p-4">
              <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4">
                ECS Compute Status
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                  <span className="text-xs text-[#8a7f75] font-semibold">Service Status</span>
                  <span className="text-sm font-bold text-[#2e7d32]">{ecs.status}</span>
                </div>
                <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                  <span className="text-xs text-[#8a7f75] font-semibold">Running Tasks</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{ecs.runningTasks}</span>
                </div>
                <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                  <span className="text-xs text-[#8a7f75] font-semibold">Task Definition</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{ecs.taskDefinition}</span>
                </div>
                <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                  <span className="text-xs text-[#8a7f75] font-semibold">Docker Image</span>
                  <span className="text-sm font-bold text-[#1565c0] hover:underline cursor-pointer">{ecs.dockerImage}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alb.hasALB && (
                  <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-[#8a7f75] font-semibold">ALB ({alb.name})</span>
                      <span className="text-sm font-bold text-[#1a1a1a]">{alb.requestCount}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.5 rounded-sm">{alb.errorRate5xx}</span>
                  </div>
                )}
                {rds.hasRDS && (
                  <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-[#8a7f75] font-semibold">RDS</span>
                      <span className="text-sm font-bold text-[#1a1a1a]">{rds.connections} connections</span>
                    </div>
                    <span className="text-xs font-semibold text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.5 rounded-sm">{rds.cpuUtilization}% CPU</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logs panel */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-[#d08873]" />
                <h2 className="text-sm font-semibold text-[#1a1a1a]">
                  GitHub Actions Logs
                </h2>
                <span className="text-[11px] text-[#8a7f75] font-medium">Last {cloudWatchLogs?.length || 0} runs &bull; {formattedEnvName}</span>
              </div>
              <button className="text-xs border border-black/5 hover:bg-[#faf9f8] px-2.5 py-1 rounded-sm text-[#6b5e52] font-semibold cursor-pointer">
                Expand
              </button>
            </div>

            <div className="bg-[#0f0e0d] border border-black/80 rounded-md p-3.5 font-mono text-[11px] leading-relaxed text-[#c9c5c0] flex flex-col gap-1.5 h-[160px] overflow-y-auto">
              {cloudWatchLogs && cloudWatchLogs.map((log, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-[#8a7f75] shrink-0">{log.timestamp}</span>
                  <span className={
                    log.level === "ERROR" ? "text-[#ff6b6b]" :
                    log.level === "WARN" ? "text-[#ffbe5c]" :
                    "text-[#80dd6d]"
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Last deployment summary card */}
          <div className="bg-white border border-black/5 rounded-md p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4">
              Last Deployment Summary
            </h2>

            <div className="grid grid-cols-3 gap-y-4 gap-x-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">PR</span>
                <span className="text-sm text-[#d08873] font-semibold hover:underline cursor-pointer">{deploymentSummary.prTitle}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Author</span>
                <span className="text-sm text-[#2b2622] font-semibold">{deploymentSummary.author}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Commit</span>
                <span className="text-sm font-mono text-[#6b5e52]">{deploymentSummary.commitID}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Files Changed</span>
                <span className="text-sm text-[#2b2622] font-semibold">{deploymentSummary.filesChanged}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Lines</span>
                <span className="text-sm text-[#2b2622] font-semibold">
                  <span className="text-[#2e7d32]">{deploymentSummary.additions}</span> / <span className="text-[#c62828]">{deploymentSummary.deletions}</span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Duration</span>
                <span className="text-sm text-[#2b2622] font-semibold">{deploymentSummary.duration}</span>
              </div>
            </div>
          </div>

          {/* Deployment History Table */}
          <div className="bg-white border border-black/5 rounded-md p-4">
            <div className="flex justify-between items-center mb-4 select-none">
              <h2 className="text-sm font-semibold text-[#1a1a1a]">
                Deployment History
              </h2>
              <button
                onClick={() => router.push("/history")}
                className="text-xs text-[#d08873] hover:text-[#be7560] font-semibold flex items-center gap-1 cursor-pointer"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            <DataTable columns={historyColumns} data={deploymentHistory || []} pageSize={5} />
          </div>
        </div>

        {/* Right Column: Linked Services and PR Context */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Linked Services */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] pb-2 border-b border-black/5">
              Linked Services
            </h2>

            <div className="flex flex-col gap-3">
              {/* RDS */}
              {rds.hasRDS && (
                <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#1a1a1a]">RDS</span>
                    <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{rds.connections} connections</span>
                      <span>&bull;</span>
                      <span>{rds.cpuUtilization}% CPU</span>
                      <span>&bull;</span>
                      <span>{rds.storageGB} GB storage</span>
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
                </div>
              )}

              {/* ALB */}
              {alb.hasALB && (
                <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#1a1a1a]">ALB</span>
                    <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{alb.requestCount}</span>
                      <span>&bull;</span>
                      <span>{alb.errorRate5xx}</span>
                      <span>&bull;</span>
                      <span>{alb.latency} latency</span>
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
                </div>
              )}

              {/* S3 */}
              {s3.hasS3 && (
                <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#1a1a1a]">S3</span>
                    <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{s3.totalObjects} objects</span>
                      <span>&bull;</span>
                      <span>{s3.storageTotal} total</span>
                      <span>&bull;</span>
                      <span>{s3.lastModified}</span>
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
                </div>
              )}

              {/* SQS */}
              {sqs.hasSQS && (
                <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-[#1a1a1a]">SQS</span>
                    <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{sqs.visibleMsgs} visible msgs</span>
                      <span>&bull;</span>
                      <span>{sqs.inFlightMsgs} in-flight</span>
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
                </div>
              )}
            </div>
          </div>

          {/* Pull Request Context */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] pb-2 border-b border-black/5">
              Pull Request Context
            </h2>

            <div className="flex flex-col gap-3 text-xs leading-relaxed text-[#6b5e52]">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">PR</span>
                <span className="text-[#d08873] font-semibold hover:underline cursor-pointer">{pullRequestContext.prNumber} — {pullRequestContext.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Author</span>
                <span className="text-[#1a1a1a] font-medium">{pullRequestContext.author}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Status</span>
                <span className="bg-[#e8f5e9] text-[#2e7d32] font-semibold px-2 py-0.5 rounded-sm">{pullRequestContext.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Branch</span>
                <span className="font-medium text-[#1a1a1a]">{pullRequestContext.branch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Files Changed</span>
                <span className="font-medium text-[#1a1a1a]">{pullRequestContext.filesChanged} files</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Diff</span>
                <span className="font-medium">
                  <span className="text-[#2e7d32]">{pullRequestContext.additions}</span> <span className="text-[#c62828]">{pullRequestContext.deletions}</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Linked Issues</span>
                <span className="text-[#d08873] font-medium">{(pullRequestContext.linkedIssues || []).join(", ")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
