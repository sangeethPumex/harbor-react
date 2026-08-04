"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { ProjectCard, Project } from "@/components/molecules/ProjectCard/ProjectCard";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { Tabs, TabData } from "@/components/atoms/Tabs/Tabs";
import { Search, Plus, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { CreateProjectModal } from "@/components/organisms/CreateProjectModal/CreateProjectModal";
import { projectService } from "@/services/project_service";
import { toast } from "sonner";

const INITIAL_PROJECTS: Project[] = [];

type FilterType = "all" | "active" | "degraded" | "archived";

function mapProjectList(projects: Array<Record<string, unknown>>): Project[] {
  return projects.map((p) => {
    const lastCommit = typeof p.lastCommit === "string" ? p.lastCommit : "";
    let lastDeployment = "N/A";
    let lastDeployedBy = "N/A";
    if (lastCommit && lastCommit.includes(" by ")) {
      const parts = lastCommit.split(" by ");
      lastDeployment = parts[0];
      lastDeployedBy = parts[1];
    } else if (lastCommit) {
      lastDeployment = lastCommit;
    }

    const totalEnv = typeof p.totalEnv === "number" ? p.totalEnv : 0;
    const statusStr = typeof p.status === "string" ? p.status : "";
    let healthyCount = totalEnv;
    let unhealthyCount = 0;
    if (statusStr === "degraded") {
      healthyCount = Math.max(0, totalEnv - 1);
      unhealthyCount = totalEnv > 0 ? 1 : 0;
    } else if (statusStr === "error") {
      healthyCount = 0;
      unhealthyCount = totalEnv;
    }

    let cardStatus: "healthy" | "degraded" | "error" = "healthy";
    if (statusStr === "degraded") cardStatus = "degraded";
    if (statusStr === "error") cardStatus = "error";

    return {
      id: String(p.id || p.projectName || ""),
      name: String(p.projectName || ""),
      description: String(p.projectDescription || ""),
      repo: String(p.githubdata || ""),
      branch: String(p.branch || ""),
      healthyCount,
      unhealthyCount,
      lastDeployment,
      lastDeployedBy,
      status: cardStatus,
    };
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [localSearch, setLocalSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* Delete Confirmation State */
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.listPage(1, "all");
      const mappedProjects: Project[] = mapProjectList(data.projects || []);
      setProjects(mappedProjects);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    projectService
      .listPage(1, "all")
      .then((data) => {
        if (!ignore) {
          const mappedProjects: Project[] = mapProjectList(data.projects || []);
          setProjects(mappedProjects);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load projects", err);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Filter project cards logic
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      proj.description.toLowerCase().includes(localSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "active") return proj.status === "healthy";
    if (filter === "degraded") return proj.status === "degraded" || proj.status === "error";
    if (filter === "archived") return false;

    return true;
  });

  const handleCreateProject = () => {
    fetchProjects();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(deleteTarget.id);
      toast.success(`Project "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = error.response?.data?.error || error.message || "Failed to delete project";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-3.5 bg-[#ede7e0] rounded w-2/3" />
                  <div className="h-2.5 bg-[#ede7e0] rounded w-full" />
                  <div className="h-2.5 bg-[#ede7e0] rounded w-4/5" />
                </div>
                <div className="h-5 w-14 bg-[#ede7e0] rounded-full" />
              </div>
              <div className="flex gap-3">
                <div className="h-2.5 bg-[#ede7e0] rounded w-1/3" />
                <div className="h-2.5 bg-[#ede7e0] rounded w-1/4" />
              </div>
              <div className="h-8 bg-[#ede7e0] rounded-md w-full" />
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
              <ProjectCard
                key={proj.id}
                project={proj}
                onDelete={(id, name) => setDeleteTarget({ id, name })}
              />
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
          <div className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[#c62828]">
              <div className="h-10 w-10 rounded-full bg-[#fdf5f2] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1a1a1a]">Delete Project</h3>
                <p className="text-xs text-[#8a7f75]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-xs text-[#6b5e52]">
              Are you sure you want to delete <strong className="text-[#1a1a1a]">{deleteTarget.name}</strong>? All associated environments, cloud resources, and member links will be permanently removed.
            </p>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-black/5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
                icon={isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                className="bg-[#c62828] hover:bg-[#b71c1c] text-white border-transparent cursor-pointer text-xs"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </div>
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
