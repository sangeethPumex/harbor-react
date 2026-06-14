"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, RotateCcw, History, ArrowRight, CheckCircle2, AlertCircle, Database, HelpCircle, Terminal } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable, Column } from "@/components/organisms/DataTable/DataTable";

interface DeploymentHistoryItem {
  timestamp: string;
  deployer: string;
  prTitle: string;
  duration: string;
  outcome: "success" | "failed";
}

const INITIAL_HISTORY: DeploymentHistoryItem[] = [
  {
    timestamp: "Jun 3, 10:22 AM",
    deployer: "Alex K.",
    prTitle: "#142 — feat: rate limiting",
    duration: "4m 12s",
    outcome: "success",
  },
  {
    timestamp: "Jun 2, 03:15 PM",
    deployer: "Priya R.",
    prTitle: "#139 — fix: token expiry",
    duration: "3m 55s",
    outcome: "success",
  },
  {
    timestamp: "Jun 2, 11:08 AM",
    deployer: "Sam T.",
    prTitle: "#137 — chore: upgrade Go 1.22",
    duration: "5m 01s",
    outcome: "success",
  },
  {
    timestamp: "Jun 1, 02:44 PM",
    deployer: "Dev N.",
    prTitle: "#134 — fix: panic in handler",
    duration: "1m 58s",
    outcome: "failed",
  },
  {
    timestamp: "Jun 1, 09:30 AM",
    deployer: "Alex K.",
    prTitle: "#131 — feat: metrics endpoint",
    duration: "4m 20s",
    outcome: "success",
  },
];

export default function EnvironmentDetailPage() {
  const { id: projectId, envName } = useParams();
  const router = useRouter();

  const [history, setHistory] = useState<DeploymentHistoryItem[]>(INITIAL_HISTORY);
  const [status, setStatus] = useState<"Live" | "Deploying">("Live");
  const [cpuUtilization, setCpuUtilization] = useState(28);
  const [connectionsCount, setConnectionsCount] = useState(42);

  const formattedProjName = typeof projectId === "string" ? projectId : "harbor-api";
  const formattedEnvName = typeof envName === "string" ? envName : "production";

  // Simulate metrics changes slightly over time for visual interactivity
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUtilization((prev) => Math.max(15, Math.min(65, prev + Math.floor(Math.random() * 5) - 2)));
      setConnectionsCount((prev) => Math.max(30, Math.min(80, prev + Math.floor(Math.random() * 3) - 1)));
    }, 4000);

    return () => clearInterval(timer);
  }, []);

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
            Last deployed Jun 3, 2026 at 10:22 AM &bull; by Alex K. &bull; PR #142 — feat: rate limiting
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
          <div className="bg-white border border-black/5 rounded-md p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4">
              ECS Compute Status
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                <span className="text-xs text-[#8a7f75] font-semibold">Service Status</span>
                <span className="text-sm font-bold text-[#2e7d32]">ACTIVE</span>
              </div>
              <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                <span className="text-xs text-[#8a7f75] font-semibold">Running Tasks</span>
                <span className="text-sm font-bold text-[#1a1a1a]">4 / 4</span>
              </div>
              <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                <span className="text-xs text-[#8a7f75] font-semibold">Task Definition</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{formattedProjName}:28</span>
              </div>
              <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex flex-col gap-1">
                <span className="text-xs text-[#8a7f75] font-semibold">Docker Image</span>
                <span className="text-sm font-bold text-[#1565c0] hover:underline cursor-pointer">c8e2b71</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#8a7f75] font-semibold">ALB</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">1,240 req/min</span>
                </div>
                <span className="text-xs font-semibold text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.5 rounded-sm">0.2% 5xx</span>
              </div>
              <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#8a7f75] font-semibold">RDS</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{connectionsCount} connections</span>
                </div>
                <span className="text-xs font-semibold text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.5 rounded-sm">{cpuUtilization}% CPU</span>
              </div>
            </div>
          </div>

          {/* Logs panel */}
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-[#d08873]" />
                <h2 className="text-sm font-semibold text-[#1a1a1a]">
                  CloudWatch Logs
                </h2>
                <span className="text-[11px] text-[#8a7f75] font-medium">Last 20 lines - /ecs/{formattedProjName}/{formattedEnvName}</span>
              </div>
              <button className="text-xs border border-black/5 hover:bg-[#faf9f8] px-2.5 py-1 rounded-sm text-[#6b5e52] font-semibold cursor-pointer">
                Expand
              </button>
            </div>

            <div className="bg-[#0f0e0d] border border-black/80 rounded-md p-3.5 font-mono text-[11px] leading-relaxed text-[#c9c5c0] flex flex-col gap-1.5 h-[160px] overflow-y-auto">
              <div className="flex gap-3"><span className="text-[#8a7f75]">10:22:41</span><span className="text-[#80dd6d]">INFO [server] Listening on :8080</span></div>
              <div className="flex gap-3"><span className="text-[#8a7f75]">10:22:39</span><span className="text-[#80dd6d]">INFO [db] Connected to RDS in 84ms</span></div>
              <div className="flex gap-3"><span className="text-[#8a7f75]">10:22:38</span><span className="text-[#80dd6d]">INFO [auth] JWT secret loaded</span></div>
              <div className="flex gap-3"><span className="text-[#8a7f75]">10:22:37</span><span className="text-[#ffbe5c]">WARN [cache] Redis not configured, using in-memory</span></div>
              <div className="flex gap-3"><span className="text-[#8a7f75]">10:22:35</span><span className="text-[#80dd6d]">INFO [init] harbor-api v1.4.2 starting up</span></div>
              <div className="flex gap-3"><span className="text-[#8a7f75]">10:22:33</span><span className="text-[#80dd6d]">INFO [config] Environment: production</span></div>
              <div className="flex gap-3"><span className="text-[#8a7f75]">10:22:31</span><span className="text-[#ff6b6b]">ERROR [ecs] Old task draining — 2 tasks remaining</span></div>
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
                <span className="text-sm text-[#d08873] font-semibold hover:underline cursor-pointer">#142 — feat: rate limiting</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Author</span>
                <span className="text-sm text-[#2b2622] font-semibold">Alex K.</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Commit</span>
                <span className="text-sm font-mono text-[#6b5e52]">c8e2b71</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Files Changed</span>
                <span className="text-sm text-[#2b2622] font-semibold">14</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Lines</span>
                <span className="text-sm text-[#2b2622] font-semibold">
                  <span className="text-[#2e7d32]">+382</span> / <span className="text-[#c62828]">-41</span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#8a7f75] font-semibold">Duration</span>
                <span className="text-sm text-[#2b2622] font-semibold">4m 12s</span>
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

            <DataTable columns={historyColumns} data={history} pageSize={5} />
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
              <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#1a1a1a]">RDS</span>
                  <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>{connectionsCount} connections</span>
                    <span>&bull;</span>
                    <span>{cpuUtilization}% CPU</span>
                    <span>&bull;</span>
                    <span>18.3 GB storage</span>
                  </span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
              </div>

              {/* ALB */}
              <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#1a1a1a]">ALB</span>
                  <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>1,240 req/min</span>
                    <span>&bull;</span>
                    <span>0.2% 5xx</span>
                    <span>&bull;</span>
                    <span>48ms latency</span>
                  </span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
              </div>

              {/* S3 */}
              <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#1a1a1a]">S3</span>
                  <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>12,340 objects</span>
                    <span>&bull;</span>
                    <span>4.2 GB total</span>
                    <span>&bull;</span>
                    <span>2h ago</span>
                  </span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
              </div>

              {/* SQS */}
              <div className="flex items-start justify-between border border-black/5 bg-[#fdfcf9] rounded-md p-3">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-[#1a1a1a]">SQS</span>
                  <span className="text-[11px] text-[#6b5e52] mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>0 visible msgs</span>
                    <span>&bull;</span>
                    <span>0 in-flight</span>
                  </span>
                </div>
                <span className="h-2 w-2 rounded-full bg-[#2e7d32] shrink-0 mt-1" />
              </div>
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
                <span className="text-[#d08873] font-semibold hover:underline cursor-pointer">#142 — feat: rate limiting</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Author</span>
                <span className="text-[#1a1a1a] font-medium">Alex K.</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Status</span>
                <span className="bg-[#e8f5e9] text-[#2e7d32] font-semibold px-2 py-0.5 rounded-sm">Merged</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Branch</span>
                <span className="font-medium text-[#1a1a1a]">feature/rate-limit</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Files Changed</span>
                <span className="font-medium text-[#1a1a1a]">14 files</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Diff</span>
                <span className="font-medium">
                  <span className="text-[#2e7d32]">+382</span> <span className="text-[#c62828]">-41</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#8a7f75]">Linked Issues</span>
                <span className="text-[#d08873] font-medium">#98, #102</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
