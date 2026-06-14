"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { ProjectCard, Project } from "@/components/molecules/ProjectCard/ProjectCard";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { Tabs, TabData } from "@/components/atoms/Tabs/Tabs";
import { Search, Plus } from "lucide-react";

// Mock Projects data representing all 6 projects shown in Image 3
const PROJECTS_DATA: Project[] = [
  {
    id: "harbor-api",
    name: "harbor-api",
    description: "Go backend service for Harbor portal",
    repo: "org/harbor-api",
    branch: "main",
    healthyCount: 4,
    unhealthyCount: 0,
    lastDeployment: "7h ago",
    lastDeployedBy: "Sangeeth.",
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
    lastDeployment: "5h ago",
    lastDeployedBy: "Priya.",
    status: "degraded",
  },
  {
    id: "terraform-aws-vpc",
    name: "terraform-aws-vpc",
    description: "AWS VPC infrastructure via Terraform",
    repo: "org/terraform-vpc",
    branch: "main",
    healthyCount: 2,
    unhealthyCount: 0,
    lastDeployment: "12h ago",
    lastDeployedBy: "Chen W.",
    status: "healthy",
  },
  {
    id: "auth-service",
    name: "auth-service",
    description: "OAuth2 & RBAC microservice",
    repo: "org/auth-service",
    branch: "main",
    healthyCount: 3,
    unhealthyCount: 0,
    lastDeployment: "2h ago",
    lastDeployedBy: "Alex K.",
    status: "healthy",
  },
  {
    id: "notification-worker",
    name: "notification-worker",
    description: "Slack & email notification worker",
    repo: "org/notif-worker",
    branch: "main",
    healthyCount: 1,
    unhealthyCount: 1,
    lastDeployment: "3d ago",
    lastDeployedBy: "Dev N.",
    status: "error",
  },
  {
    id: "data-pipeline",
    name: "data-pipeline",
    description: "ETL pipeline for analytics reporting",
    repo: "org/data-pipeline",
    branch: "main",
    healthyCount: 3,
    unhealthyCount: 0,
    lastDeployment: "2h ago",
    lastDeployedBy: "Alex K.",
    status: "healthy",
  },
];

type FilterType = "all" | "active" | "degraded" | "archived";

const FILTER_TABS: TabData[] = [
  ["all", "All (6)"],
  ["active", "Active (5)"],
  ["degraded", "Degraded (1)"],
  ["archived", "Archived"],
];

export default function ProjectsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [localSearch, setLocalSearch] = useState("");

  // Filter project cards logic
  const filteredProjects = PROJECTS_DATA.filter((proj) => {
    // Local search matches name or description
    const matchesSearch =
      proj.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      proj.description.toLowerCase().includes(localSearch.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter matches
    if (filter === "active") return proj.status === "healthy";
    if (filter === "degraded") return proj.status === "degraded" || proj.status === "error";
    if (filter === "archived") return false; // None are archived in the mock set

    return true; // "all"
  });

  return (
    <AppLayout searchPlaceholder="Search projects in workspace...">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-5 select-none">
        <h1 className="text-[22px] font-medium text-[#1a1a1a]">
          Projects
        </h1>
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={14} className="stroke-[3]" />}
          width="w-auto"
          className="cursor-pointer"
        >
          New Project
        </Button>
      </div>

      {/* Local Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-black/5 rounded-md p-3 mb-5 select-none">
        {/* Search Field */}
        <div className="w-full md:w-72">
          <InputField
            placeholder="Search projects..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            iconLeft={<Search size={14} className="stroke-[2.5]" />}
          />
        </div>

        {/* Tab Filters */}
        <Tabs
          data={FILTER_TABS}
          activeTab={filter}
          setActiveTab={(val) => setFilter(val as FilterType)}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((proj) => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white border border-black/5 rounded-md p-16 text-center select-none">
          <p className="text-sm font-medium text-[#6b5e52]">No projects found</p>
          <p className="text-xs text-[#8a7f75] mt-1">
            Try adjusting your search criteria or tabs filter.
          </p>
        </div>
      )}
    </AppLayout>
  );
}
