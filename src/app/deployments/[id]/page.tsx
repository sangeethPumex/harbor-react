"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, CheckCircle2, Loader2, Hourglass, XCircle, AlertCircle, Terminal } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  name: string;
  command: string;
  duration: string;
  status: "completed" | "running" | "pending" | "failed";
  elapsed: number;
}

interface LogLine {
  time: string;
  level: "INFO" | "WARN" | "ERROR" | "LOG";
  message: string;
}

const INITIAL_STEPS: Step[] = [
  {
    name: "Source Checkout",
    command: "git clone org/harbor-api @ a3f9d12",
    duration: "4s",
    status: "completed",
    elapsed: 4,
  },
  {
    name: "Build Application Artifact",
    command: "tar -czf harbor-api-a3f9d12.tar.gz",
    duration: "1m 12s",
    status: "completed",
    elapsed: 72,
  },
  {
    name: "Upload to S3",
    command: "s3://harbor-build-artifacts/harbor-api/",
    duration: "38s",
    status: "completed",
    elapsed: 38,
  },
  {
    name: "CodeDeploy Deployment",
    command: "Rolling update · 2/4 instances running new revision",
    duration: "running... 40s",
    status: "running",
    elapsed: 40,
  },
  {
    name: "Health Check",
    command: "ALB target group validation",
    duration: "",
    status: "pending",
    elapsed: 0,
  },
  {
    name: "Post-deploy Hooks",
    command: "Slack notification · cache invalidation",
    duration: "",
    status: "pending",
    elapsed: 0,
  },
];

const INITIAL_LOGS: LogLine[] = [
  { time: "12:05:02", level: "INFO", message: "Triggered by Sam T. via Harbor UI" },
  { time: "12:05:03", level: "INFO", message: "Cloning org/harbor-api @ a3f9d12" },
  { time: "12:05:07", level: "INFO", message: "Clone complete in 4s" },
  { time: "12:05:08", level: "INFO", message: "Packaging application artifact (harbor-api-a3f9d12.tar.gz)" },
  { time: "12:05:10", level: "LOG", message: "Compressing go binary..." },
  { time: "12:05:14", level: "INFO", message: "Running app pre-packaging verification checks..." },
  { time: "12:05:42", level: "INFO", message: "Verification check complete." },
  { time: "12:06:20", level: "INFO", message: "Bundle packaged successfully (1m 12s)" },
  { time: "12:06:21", level: "INFO", message: "Uploading bundle package to S3 bucket..." },
  { time: "12:06:59", level: "INFO", message: "Upload complete (38s)" },
  { time: "12:07:00", level: "INFO", message: "Triggering CodeDeploy agent on Auto Scaling Group" },
  { time: "12:07:01", level: "INFO", message: "New launch template active: harbor-api-lt:13" },
  { time: "12:07:05", level: "INFO", message: "Rolling instance replacement deploy started — 4 instances" },
  { time: "12:07:10", level: "INFO", message: "Instance 1 (i-0abc12): PENDING ➔ RUNNING" },
  { time: "12:07:32", level: "INFO", message: "Instance 2 (i-0def34): PENDING ➔ RUNNING" },
];

export default function DeploymentLogsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [timeElapsed, setTimeElapsed] = useState(161); // 2m 41s
  const [status, setStatus] = useState<"running" | "success" | "aborted">("running");
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Format Elapsed Time: mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Autoscroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle ticking timer and progress animation
  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);

      // Increment running step elapsed time
      setSteps((prevSteps) =>
        prevSteps.map((step) =>
          step.status === "running"
            ? { ...step, elapsed: step.elapsed + 1, duration: `running... ${step.elapsed + 1}s` }
            : step
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Simulate deployment logs addition over time
  useEffect(() => {
    if (status !== "running") return;

    const timer = setTimeout(() => {
      // Step 4 finishes, Step 5 starts (Health check)
      setSteps((prev) => {
        const copy = [...prev];
        copy[3] = { ...copy[3], status: "completed", duration: "2m 14s" };
        copy[4] = { ...copy[4], status: "running", duration: "running... 0s" };
        return copy;
      });

      setLogs((prev) => [
        ...prev,
        { time: "12:07:44", level: "INFO", message: "Instance 1 (i-0abc12): RUNNING ➔ HEALTHY" },
        { time: "12:07:51", level: "INFO", message: "Instance 2 (i-0def34): RUNNING ➔ HEALTHY" },
        { time: "12:07:54", level: "INFO", message: "Instance 3 (i-0ghi56): PENDING ➔ RUNNING" },
        { time: "12:08:13", level: "INFO", message: "Instance 3 (i-0ghi56): RUNNING ➔ HEALTHY" },
        { time: "12:08:16", level: "INFO", message: "Instance 4 (i-0jkl78): PENDING ➔ RUNNING" },
        { time: "12:08:24", level: "INFO", message: "Instance 4 (i-0jkl78): RUNNING ➔ HEALTHY" },
        { time: "12:08:27", level: "INFO", message: "Rolling update complete — 4/4 instances replacement complete" },
        { time: "12:08:31", level: "INFO", message: "ALB target group: all host registration healthy" },
      ]);

      // Stage 6 - post-deploy hooks after 6 seconds
      setTimeout(() => {
        setSteps((prev) => {
          const copy = [...prev];
          copy[4] = { ...copy[4], status: "completed", duration: "18s" };
          copy[5] = { ...copy[5], status: "running", duration: "running... 0s" };
          return copy;
        });

        setLogs((prev) => [
          ...prev,
          { time: "12:08:34", level: "INFO", message: "Post-deploy: sending Slack notifications..." },
          { time: "12:08:35", level: "INFO", message: "Slack notification sent successfully." },
        ]);

        // Finish whole deployment after 4 more seconds
        setTimeout(() => {
          setSteps((prev) => {
            const copy = [...prev];
            copy[5] = { ...copy[5], status: "completed", duration: "8s" };
            return copy;
          });
          setLogs((prev) => [
            ...prev,
            { time: "12:08:38", level: "INFO", message: "Deployment #143 completed successfully in 3m 36s" },
          ]);
          setStatus("success");
        }, 4000);

      }, 6000);

    }, 8000);

    return () => clearTimeout(timer);
  }, [status]);

  const handleAbort = () => {
    setStatus("aborted");
    setSteps((prev) =>
      prev.map((s) => (s.status === "running" ? { ...s, status: "failed", duration: "Failed" } : s))
    );
    setLogs((prev) => [
      ...prev,
      { time: new Date().toLocaleTimeString(), level: "ERROR", message: "Deployment aborted by User" },
      { time: new Date().toLocaleTimeString(), level: "ERROR", message: "Deployment failed" },
    ]);
  };

  const currentDeploymentId = typeof id === "string" ? `#${id}` : "#143";

  return (
    <AppLayout searchPlaceholder="Search logs...">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5 pb-4 border-b border-black/5 select-none animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-medium text-[#1a1a1a]">Deployment {currentDeploymentId}</h1>
            <Badge
              variant={status === "running" ? "warning" : status === "success" ? "success" : "danger"}
              className="text-xs px-2 py-0.5 rounded-sm"
              showDot={false}
            >
              {status === "running" ? "running" : status === "success" ? "success" : "aborted"}
            </Badge>
          </div>
          <p className="text-sm text-[#6b5e52] mt-1">
            harbor-api &bull; uat environment &bull; Triggered by Sam T. &bull; Jun 3, 2026 12:05 PM
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#8a7f75] font-semibold block uppercase tracking-wider">Elapsed Time</span>
          <span className="text-3xl font-bold text-[#1a1a1a] tracking-tight">{formatTime(timeElapsed)}</span>
        </div>
      </div>

      {/* Meta tags segment */}
      <div className="bg-[#fdfcf9] border border-black/5 rounded-md p-3.5 mb-5 flex flex-wrap gap-2.5 items-center select-none text-xs font-semibold text-[#6b5e52] animate-slide-up">
        <span className="bg-white border border-black/5 px-2 py-1 rounded-sm text-[#d08873]">
          #143
        </span>
        <span className="text-[#1a1a1a] font-medium">feat: structured logs</span>
        <span className="text-[#8a7f75] font-medium">/</span>
        <span className="bg-white border border-black/5 px-2 py-1 rounded-sm text-[#8a7f75]">
          feature/logging
        </span>
        <span className="bg-white border border-black/5 px-2 py-1 rounded-sm font-mono text-[#8a7f75]">
          a3f9d12
        </span>
        <span className="text-[#8a7f75]">by Sam T.</span>
        <span className="ml-auto text-[#2e7d32]">+128</span>
        <span className="text-[#c62828]">-14</span>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-slide-up">
        {/* Left Column: Steps and EC2 details */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Steps panel */}
          <div className="bg-white border border-black/5 rounded-md p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
              Deployment Steps
            </h2>

            <div className="flex flex-col pl-2 border-l border-black/5 gap-6 relative ml-3">
              {steps.map((step, index) => {
                const isCompleted = step.status === "completed";
                const isRunning = step.status === "running";
                const isFailed = step.status === "failed";
                const isPending = step.status === "pending";

                return (
                  <div key={index} className="relative flex gap-4 items-start pl-6">
                    {/* Circle indicators absolute placement on left border */}
                    <div className="absolute -left-[13px] top-1 z-10 flex items-center justify-center">
                      {isCompleted && (
                        <div className="bg-[#2e7d32] text-white rounded-full p-0.5">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      {isRunning && (
                        <div className="bg-[#fff3e0] text-[#e65100] border border-[#e65100]/20 rounded-full p-0.5 animate-spin">
                          <Loader2 size={16} />
                        </div>
                      )}
                      {isFailed && (
                        <div className="bg-[#ffebee] text-[#c62828] rounded-full p-0.5">
                          <XCircle size={16} />
                        </div>
                      )}
                      {isPending && (
                        <div className="bg-[#fdfcf9] border border-black/10 text-[#8a7f75] rounded-full p-0.5">
                          <Hourglass size={16} />
                        </div>
                      )}
                    </div>

                    {/* Step details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-sm font-semibold ${isRunning ? "text-[#e65100]" : "text-[#1a1a1a]"}`}>
                          {step.name}
                        </h3>
                        {step.duration && (
                          <span className={`text-[11px] font-medium ${isRunning ? "text-[#e65100]" : "text-[#8a7f75]"}`}>
                            {step.duration}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6b5e52] mt-0.5 font-medium leading-normal">
                        {step.command}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EC2 Deployment State panel */}
          <div className="bg-white border border-black/5 rounded-md p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
              EC2 Deployment State
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              {/* Instance 1 */}
              <div className="border border-[#2e7d32]/25 bg-[#e8f5e9]/10 rounded-md p-3.5 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={18} className="text-[#2e7d32] mb-1.5" />
                <span className="text-xs font-semibold text-[#2e7d32]">Instance 1</span>
                <span className="text-[11px] text-[#6b5e52] mt-0.5">i-0abc12 &bull; healthy</span>
              </div>

              {/* Instance 2 */}
              <div className="border border-[#2e7d32]/25 bg-[#e8f5e9]/10 rounded-md p-3.5 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={18} className="text-[#2e7d32] mb-1.5" />
                <span className="text-xs font-semibold text-[#2e7d32]">Instance 2</span>
                <span className="text-[11px] text-[#6b5e52] mt-0.5">i-0def34 &bull; healthy</span>
              </div>

              {/* Instance 3 */}
              <div className={`border rounded-md p-3.5 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                status === "success" 
                  ? "border-[#2e7d32]/25 bg-[#e8f5e9]/10" 
                  : status === "aborted" 
                  ? "border-[#c62828]/25 bg-[#ffebee]/10"
                  : "border-[#e65100]/25 bg-[#fff3e0]/10"
              }`}>
                {status === "success" ? (
                  <CheckCircle2 size={18} className="text-[#2e7d32] mb-1.5" />
                ) : status === "aborted" ? (
                  <XCircle size={18} className="text-[#c62828] mb-1.5" />
                ) : (
                  <Loader2 size={18} className="text-[#e65100] mb-1.5 animate-spin" />
                )}
                <span className={`text-xs font-semibold ${
                  status === "success" 
                    ? "text-[#2e7d32]" 
                    : status === "aborted" 
                    ? "text-[#c62828]"
                    : "text-[#e65100]"
                }`}>Instance 3</span>
                <span className="text-[11px] text-[#6b5e52] mt-0.5">
                  i-0ghi56 &bull; {status === "success" ? "healthy" : status === "aborted" ? "failed" : "deploying"}
                </span>
              </div>

              {/* Instance 4 */}
              <div className={`border rounded-md p-3.5 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                status === "success" 
                  ? "border-[#2e7d32]/25 bg-[#e8f5e9]/10" 
                  : status === "aborted" 
                  ? "border-[#c62828]/25 bg-[#ffebee]/10"
                  : steps[4].status === "running"
                  ? "border-[#e65100]/25 bg-[#fff3e0]/10"
                  : "border-black/5 bg-[#fdfcf9]"
              }`}>
                {status === "success" ? (
                  <CheckCircle2 size={18} className="text-[#2e7d32] mb-1.5" />
                ) : status === "aborted" ? (
                  <XCircle size={18} className="text-[#c62828] mb-1.5" />
                ) : steps[4].status === "running" ? (
                  <Loader2 size={18} className="text-[#e65100] mb-1.5 animate-spin" />
                ) : (
                  <Hourglass size={18} className="text-[#8a7f75] mb-1.5" />
                )}
                <span className={`text-xs font-semibold ${
                  status === "success" 
                    ? "text-[#2e7d32]" 
                    : status === "aborted" 
                    ? "text-[#c62828]"
                    : steps[4].status === "running"
                    ? "text-[#e65100]"
                    : "text-[#8a7f75]"
                }`}>Instance 4</span>
                <span className="text-[11px] text-[#6b5e52] mt-0.5">
                  i-0jkl78 &bull; {status === "success" ? "healthy" : status === "aborted" ? "failed" : steps[4].status === "running" ? "deploying" : "pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Log Stream */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-black/5 rounded-md p-4 flex flex-col h-[520px]">
            <div className="flex justify-between items-center pb-3 border-b border-black/5 mb-3 select-none">
              <div className="flex items-center gap-2">
                <Terminal size={15} className="text-[#d08873]" />
                <h2 className="text-sm font-semibold text-[#1a1a1a]">
                  Live Log Stream
                </h2>
              </div>

              {status === "running" && (
                <button
                  onClick={handleAbort}
                  className="bg-[#c62828] hover:bg-[#b71c1c] text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                >
                  Abort Deployment
                </button>
              )}
            </div>

            {/* Black Terminal Log container */}
            <div className="flex-1 bg-[#0f0e0d] border border-black/80 rounded-md p-4 overflow-y-auto font-mono text-[11px] leading-relaxed text-[#c9c5c0] h-full flex flex-col gap-1.5">
              {logs.map((log, idx) => {
                let colorClass = "text-[#80dd6d]"; // Info
                if (log.level === "ERROR") colorClass = "text-[#ff6b6b]";
                if (log.level === "WARN") colorClass = "text-[#ffbe5c]";
                if (log.level === "LOG") colorClass = "text-[#a4a09a]";

                return (
                  <div key={idx} className="flex gap-2">
                    <span className="text-[#a4a09a] select-none">{log.time}</span>
                    {log.level !== "LOG" && (
                      <span className={`font-semibold shrink-0 ${colorClass}`}>[{log.level}]</span>
                    )}
                    <span className={colorClass}>{log.message}</span>
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
