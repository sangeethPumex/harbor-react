"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { ProjectCard, Project } from "@/components/molecules/ProjectCard/ProjectCard";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { Tabs, TabData } from "@/components/atoms/Tabs/Tabs";
import { Search, Plus } from "lucide-react";
import { CreateProjectModal } from "@/components/organisms/CreateProjectModal/CreateProjectModal";
import { projectService } from "@/services/project_service";

const INITIAL_PROJECTS: Project[] = [];

type FilterType = "all" | "active" | "degraded" | "archived";

const FILTER_TABS: TabData[] = [
  ["all", "All"],
  ["active", "Active"],
  ["degraded", "Degraded"],
  ["archived", "Archived"],
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [localSearch, setLocalSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.listPage(1, "all");
      
      const mappedProjects: Project[] = (data.projects || []).map((p: any) => {
        let lastDeployment = "N/A";
        let lastDeployedBy = "N/A";
        if (p.lastCommit && p.lastCommit.includes(" by ")) {
          const parts = p.lastCommit.split(" by ");
          lastDeployment = parts[0];
          lastDeployedBy = parts[1];
        } else if (p.lastCommit) {
          lastDeployment = p.lastCommit;
        }

        let healthyCount = p.totalEnv;
        let unhealthyCount = 0;
        if (p.status === "degraded") {
          healthyCount = Math.max(0, p.totalEnv - 1);
          unhealthyCount = p.totalEnv > 0 ? 1 : 0;
        } else if (p.status === "error") {
          healthyCount = 0;
          unhealthyCount = p.totalEnv;
        }

        let cardStatus: "healthy" | "degraded" | "error" = "healthy";
        if (p.status === "degraded") cardStatus = "degraded";
        if (p.status === "error") cardStatus = "error";

        return {
          id: p.id || p.projectName,
          name: p.projectName,
          description: p.projectDescription,
          repo: p.githubdata,
          branch: p.branch,
          healthyCount,
          unhealthyCount,
          lastDeployment,
          lastDeployedBy,
          status: cardStatus
        };
      });

      setProjects(mappedProjects);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter project cards logic
  const filteredProjects = projects.filter((proj) => {
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

  const handleCreateProject = (newProj: Project) => {
    fetchProjects();
  };

  const allCount = projects.length;
  const activeCount = projects.filter(p => p.status === "healthy").length;
  const degradedCount = projects.filter(p => p.status === "degraded" || p.status === "error").length;
  const archivedCount = 0;

  const filterTabsWithCounts: TabData[] = [
    ["all", `All (${allCount})`],
    ["active", `Active (${activeCount})`],
    ["degraded", `Degraded (${degradedCount})`],
    ["archived", `Archived (${archivedCount})`],
  ];

  return (
    <AppLayout searchPlaceholder="Search projects in workspace...">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-5 select-none animate-fade-in">
        <h1 className="text-[22px] font-medium text-[#1a1a1a]">
          Projects
        </h1>
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={14} className="stroke-[3]" />}
          width="w-auto"
          className="cursor-pointer"
          onClick={() => setIsCreateOpen(true)}
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
          data={filterTabsWithCounts}
          activeTab={filter}
          setActiveTab={(val) => setFilter(val as FilterType)}
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-black/5 rounded-md p-5 flex flex-col gap-4">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3.5 bg-[#ede7e0] rounded w-2/3" />
                  <div className="h-2.5 bg-[#ede7e0] rounded w-full" />
                  <div className="h-2.5 bg-[#ede7e0] rounded w-4/5" />
                </div>
                <div className="h-5 w-14 bg-[#ede7e0] rounded-full" />
              </div>
              {/* Meta row */}
              <div className="flex gap-3">
                <div className="h-2.5 bg-[#ede7e0] rounded w-1/3" />
                <div className="h-2.5 bg-[#ede7e0] rounded w-1/4" />
              </div>
              {/* Environments bar */}
              <div className="h-8 bg-[#ede7e0] rounded-md w-full" />
              {/* Footer */}
              <div className="flex justify-between items-center pt-1 border-t border-black/5">
                <div className="h-2.5 bg-[#ede7e0] rounded w-2/5" />
                <div className="h-7 w-20 bg-[#ede7e0] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 select-none">
            {filteredProjects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="bg-white border border-black/5 rounded-md p-16 text-center select-none animate-scale-in">
              <p className="text-sm font-medium text-[#6b5e52]">No projects found</p>
              <p className="text-xs text-[#8a7f75] mt-1">
                Try adjusting your search criteria or tabs filter.
              </p>
            </div>
          )}
        </>
      )}

      {/* Create Project Modal Wizard */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />
    </AppLayout>
  );
}
