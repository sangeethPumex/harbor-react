"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import {
  ProjectCard,
  Project,
} from "@/components/molecules/ProjectCard/ProjectCard";
import {
  ActivityFeed,
  ActivityItem,
} from "@/components/organisms/ActivityFeed/ActivityFeed";
import {
  DeploymentChart,
  ChartData,
} from "@/components/organisms/DeploymentChart/DeploymentChart";
import {
  dashboardService,
  DashboardKPI,
  DashboardActivityItem,
  ProjectDeploymentGraphItem,
} from "@/services/dashboard_service";
import { projectService } from "@/services/project_service";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [kpi, setKpi] = useState<DashboardKPI | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Fetch KPI, Recent Activities, and Deployments Graph in parallel
        const [kpiRes, actRes, graphRes, projListRes] = await Promise.allSettled([
          dashboardService.getKPI(),
          dashboardService.getRecentActivities(),
          dashboardService.getDeploymentsGraph(),
          projectService.listPage(1, "all"),
        ]);

        if (kpiRes.status === "fulfilled") {
          setKpi(kpiRes.value);
        }

        if (actRes.status === "fulfilled" && Array.isArray(actRes.value)) {
          const mappedActivities: ActivityItem[] = actRes.value.map((item, idx) => {
            let status: ActivityItem["status"] = "deployed";
            if (item.type === "deployment") {
              const titleLower = item.title.toLowerCase();
              if (titleLower.includes("success")) {
                status = "deployed";
              } else if (titleLower.includes("failure") || titleLower.includes("fail")) {
                status = "error";
              } else {
                status = "deploying";
              }
            } else if (item.type === "pr_merged") {
              status = "active";
            } else {
              status = "idle";
            }

            return {
              id: `${item.timestamp}-${idx}`,
              project: item.project || item.title,
              status: status,
              user: item.author || "System",
            };
          });
          setActivities(mappedActivities);
        }

        if (graphRes.status === "fulfilled" && Array.isArray(graphRes.value)) {
          const mappedChart: ChartData[] = graphRes.value.map((item) => {
            // Sum all deployments across months for this project
            const total = Object.values(item.data || {}).reduce((acc, curr) => acc + curr, 0);
            return {
              label: item.project_name,
              shortLabel: item.project_name.length > 12 ? item.project_name.slice(0, 10) + ".." : item.project_name,
              value: total,
            };
          });
          setChartData(mappedChart);
        }

        if (projListRes.status === "fulfilled" && projListRes.value?.projects) {
          const mappedProjects: Project[] = projListRes.value.projects.map((p: any) => ({
            id: p.id,
            name: p.projectName,
            description: p.projectDescription,
            repo: p.githubdata || "",
            branch: p.branch || "main",
            healthyCount: p.totalEnv || 0,
            unhealthyCount: 0,
            lastDeployment: p.lastCommit || "N/A",
            lastDeployedBy: "N/A",
            status: p.status === "active" ? "healthy" : "degraded",
          }));
          setProjects(mappedProjects);
          setFilteredProjects(mappedProjects);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  };

  const healthyEnvironments = kpi?.healthy_environments ?? 0;
  const unhealthyEnvironments = kpi?.unhealthy_environments ?? 0;
  const totalEnvironments = kpi?.total_environments ?? (healthyEnvironments + unhealthyEnvironments);
  const healthyPct = totalEnvironments > 0 ? Math.round((healthyEnvironments / totalEnvironments) * 100) : 100;
  const unhealthyPct = 100 - healthyPct;

  return (
    <AppLayout
      onSearchChange={handleSearch}
      searchPlaceholder="Search projects..."
    >
      {/* Page Heading */}
      <div className="mb-5 flex justify-between items-center select-none">
        <h1 className="text-[22px] font-medium tracking-tight text-[#1a1a1a]">
          Dashboard Overview
        </h1>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Card 1 — Environments */}
        <div className="bg-white border border-black/5 rounded-md p-4 hover:shadow-sm transition-shadow duration-200">
          <span className="text-xs font-medium text-[#8a7f75] block">
            Environments
          </span>
          <span className="text-2xl font-semibold text-[#1a1a1a] block mt-1 leading-none">
            {loading ? "..." : totalEnvironments}
          </span>
          <span className="text-xs font-medium text-[#6b5e52] mt-2 block">
            <span className="text-[#2e7d32]">{healthyEnvironments} healthy</span>
            {" · "}
            <span className="text-[#c62828]">{unhealthyEnvironments} unhealthy</span>
          </span>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#fdfcf9] rounded-full overflow-hidden flex mt-3">
            <div className="h-full bg-[#2e7d32]" style={{ width: `${healthyPct}%` }} />
            <div className="h-full bg-[#c62828]" style={{ width: `${unhealthyPct}%` }} />
          </div>
        </div>

        {/* Card 2 — Deployments Past Hour */}
        <div className="bg-white border border-black/5 rounded-md p-4 hover:shadow-sm transition-shadow duration-200">
          <span className="text-xs font-medium text-[#8a7f75] block">
            Deployments (Past 1h)
          </span>
          <span className="text-2xl font-semibold text-[#1a1a1a] block mt-1 leading-none">
            {loading ? "..." : (kpi?.deployments_past_hour ?? 0)}
          </span>
          <span className="text-xs font-medium text-[#e65100] mt-2 block">
            in the last 60 minutes
          </span>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#fdfcf9] rounded-full overflow-hidden mt-3 relative">
            <div
              className="h-full bg-[#e65100] animate-pulse"
              style={{ width: kpi?.deployments_past_hour ? "100%" : "15%" }}
            />
          </div>
        </div>

        {/* Card 3 — Last 24h */}
        <div className="bg-white border border-black/5 rounded-md p-4 hover:shadow-sm transition-shadow duration-200">
          <span className="text-xs font-medium text-[#8a7f75] block">
            Last 24 hours
          </span>
          <span className="text-2xl font-semibold text-[#1a1a1a] block mt-1 leading-none">
            {loading ? "..." : (kpi?.deployments_past_24_hours ?? 0)}
          </span>
          <span className="text-xs font-medium text-[#6b5e52] mt-2 block">
            deployments across all repos
          </span>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#fdfcf9] rounded-full overflow-hidden flex mt-3">
            <div className="h-full bg-[#2e7d32]" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Card 4 — Deployment frequency */}
        <div className="bg-white border border-black/5 rounded-md p-4 hover:shadow-sm transition-shadow duration-200">
          <span className="text-xs font-medium text-[#8a7f75] block">
            Deployment frequency
          </span>
          <span className="text-2xl font-semibold text-[#1a1a1a] block mt-1 leading-none">
            {loading ? "..." : (kpi?.deployment_frequency_weekly_average?.toFixed(1) ?? "0.0")}
          </span>
          <span className="text-xs font-medium text-[#6b5e52] mt-2 block">
            weekly average
          </span>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#fdfcf9] rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#d08873]" style={{ width: "70%" }} />
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Side: Projects Grid and Deployment Chart */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Recent Projects Grid */}
          <div>
            <div className="flex justify-between items-center mb-3 select-none">
              <h2 className="text-sm font-semibold text-[#1a1a1a]">
                Recent Projects
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
              {filteredProjects.length === 0 && !loading && (
                <div className="col-span-2 bg-white border border-black/5 rounded-md p-8 text-center text-sm text-[#8a7f75]">
                  No projects found.
                </div>
              )}
            </div>
          </div>

          {/* Deployment Bar Chart */}
          <div className="bg-white border border-black/5 rounded-md p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
              Projects with Most Deployment
            </h2>
            {chartData.length > 0 ? (
              <DeploymentChart data={chartData} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[#8a7f75]">
                {loading ? "Loading graph..." : "No deployment graph data available."}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Recent Activity Timeline */}
        <div className="flex flex-col lg:h-0 lg:min-h-full">
          <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3 select-none">
            Recent Activity
          </h2>
          {activities.length > 0 ? (
            <ActivityFeed activities={activities} />
          ) : (
            <div className="bg-white border border-black/5 rounded-md p-6 text-center text-xs text-[#8a7f75]">
              {loading ? "Loading activities..." : "No recent activity recorded."}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
