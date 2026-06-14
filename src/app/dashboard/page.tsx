"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { ProjectCard, Project } from "@/components/molecules/ProjectCard/ProjectCard";
import { ActivityFeed, ActivityItem } from "@/components/organisms/ActivityFeed/ActivityFeed";
import { DeploymentChart, ChartData } from "@/components/organisms/DeploymentChart/DeploymentChart";

// Mock Projects data matching screenshot
const INITIAL_PROJECTS: Project[] = [
  {
    id: "harbor-api",
    name: "harbor-api",
    description: "Go backend service for Harbor portal",
    repo: "org/harbor-api",
    branch: "main",
    healthyCount: 4,
    unhealthyCount: 0,
    lastDeployment: "2 hours ago",
    lastDeployedBy: "Alex K.",
    status: "healthy",
  },
  {
    id: "harbor-frontend",
    name: "harbor-frontend",
    description: "Angular frontend application",
    repo: "org/harbor-frontend",
    branch: "main",
    healthyCount: 2,
    unhealthyCount: 1,
    lastDeployment: "5 hours ago",
    lastDeployedBy: "Priya R.",
    status: "degraded",
  },
  {
    id: "auth-service",
    name: "auth-service",
    description: "OAuth2 & RBAC microservice",
    repo: "org/auth-service",
    branch: "main",
    healthyCount: 3,
    unhealthyCount: 0,
    lastDeployment: "1 day ago",
    lastDeployedBy: "Maria G.",
    status: "healthy",
  },
  {
    id: "notification-worker",
    name: "notification-worker",
    description: "Slack & email notification worker",
    repo: "org/notif-worker",
    branch: "main",
    healthyCount: 4,
    unhealthyCount: 0,
    lastDeployment: "6 hours ago",
    lastDeployedBy: "Sangeeth.",
    status: "healthy",
  },
];

// Mock Recent Activity matching screenshot
const ACTIVITIES: ActivityItem[] = [
  { id: "1", project: "payment-service", status: "deploying", user: "Arjun" },
  { id: "2", project: "user-authentication", status: "active", user: "Maya" },
  { id: "3", project: "order-management", status: "idle", user: "Liam" },
  { id: "4", project: "inventory-tracking", status: "deployed", user: "Zara" },
  { id: "5", project: "notification-system", status: "error", user: "Ethan" },
  { id: "6", project: "report-generator", status: "deploying", user: "Sophia" },
  { id: "7", project: "customer-support", status: "idle", user: "Aiden" },
];

// Mock Chart Data matching screenshot
const DEPLOYMENT_CHART_DATA: ChartData[] = [
  { label: "auth-microservice", shortLabel: "auth-micro....", value: 18 },
  { label: "harbor-api", shortLabel: "harbor-api", value: 23 },
  { label: "harbor-auth", shortLabel: "harbor-auth", value: 25 },
  { label: "harbor-tenant", shortLabel: "harbor-tena..", value: 8 },
  { label: "go-engine", shortLabel: "go-engine", value: 21 },
  { label: "amplify-fe", shortLabel: "amplify-fe", value: 27 },
  { label: "test-language", shortLabel: "test-languag..", value: 11 },
];

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setProjects(INITIAL_PROJECTS);
    } else {
      const filtered = INITIAL_PROJECTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      );
      setProjects(filtered);
    }
  };

  return (
    <AppLayout onSearchChange={handleSearch} searchPlaceholder="Search projects...">
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
            15
          </span>
          <span className="text-xs font-medium text-[#6b5e52] mt-2 block">
            <span className="text-[#2e7d32]">14 healthy</span>
            {" · "}
            <span className="text-[#c62828]">1 unhealthy</span>
          </span>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#fdfcf9] rounded-full overflow-hidden flex mt-3">
            <div className="h-full bg-[#2e7d32]" style={{ width: "93%" }} />
            <div className="h-full bg-[#c62828]" style={{ width: "7%" }} />
          </div>
        </div>

        {/* Card 2 — Active Deployments */}
        <div className="bg-white border border-black/5 rounded-md p-4 hover:shadow-sm transition-shadow duration-200">
          <span className="text-xs font-medium text-[#8a7f75] block">
            Deployments
          </span>
          <span className="text-2xl font-semibold text-[#1a1a1a] block mt-1 leading-none">
            2
          </span>
          <span className="text-xs font-medium text-[#e65100] mt-2 block">
            in progress right now
          </span>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#fdfcf9] rounded-full overflow-hidden mt-3 relative">
            <div className="h-full bg-[#e65100] animate-pulse" style={{ width: "50%" }} />
          </div>
        </div>

        {/* Card 3 — Last 24h */}
        <div className="bg-white border border-black/5 rounded-md p-4 hover:shadow-sm transition-shadow duration-200">
          <span className="text-xs font-medium text-[#8a7f75] block">
            Last 24 hours
          </span>
          <span className="text-2xl font-semibold text-[#1a1a1a] block mt-1 leading-none">
            11
          </span>
          <span className="text-xs font-medium text-[#6b5e52] mt-2 block">
            <span className="text-[#2e7d32]">10 succeeded</span>
            {" · "}
            <span className="text-[#c62828]">1 failed</span>
          </span>
          {/* Progress Bar */}
          <div className="h-1 w-full bg-[#fdfcf9] rounded-full overflow-hidden flex mt-3">
            <div className="h-full bg-[#2e7d32]" style={{ width: "91%" }} />
            <div className="h-full bg-[#c62828]" style={{ width: "9%" }} />
          </div>
        </div>

        {/* Card 4 — Deployment frequency */}
        <div className="bg-white border border-black/5 rounded-md p-4 hover:shadow-sm transition-shadow duration-200">
          <span className="text-xs font-medium text-[#8a7f75] block">
            Deployment frequency
          </span>
          <span className="text-2xl font-semibold text-[#1a1a1a] block mt-1 leading-none">
            8
          </span>
          <span className="text-xs font-medium text-[#6b5e52] mt-2 block">
            deploys today &bull; 34 this week
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
              {projects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
              {projects.length === 0 && (
                <div className="col-span-2 bg-white border border-black/5 rounded-md p-8 text-center text-sm text-[#8a7f75]">
                  No projects match your search query.
                </div>
              )}
            </div>
          </div>

          {/* Deployment Bar Chart */}
          <div className="bg-white border border-black/5 rounded-md p-4">
            <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
              Projects with Most Deployment
            </h2>
            <DeploymentChart data={DEPLOYMENT_CHART_DATA} />
          </div>
        </div>

        {/* Right Side: Recent Activity Timeline */}
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3 select-none">
            Recent Activity
          </h2>
          <ActivityFeed activities={ACTIVITIES} />
        </div>
      </div>
    </AppLayout>
  );
}
