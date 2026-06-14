"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, FolderOpen, ArrowRight } from "lucide-react";

export interface Project {
  id: string;
  name: string;
  description: string;
  repo: string;
  branch: string;
  healthyCount: number;
  unhealthyCount: number;
  lastDeployment: string;
  lastDeployedBy: string;
  status: "healthy" | "degraded" | "error";
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const totalEnvs = project.healthyCount + project.unhealthyCount;

  // Calculate health bar percentages
  const healthyPercentage = (project.healthyCount / totalEnvs) * 100;
  const unhealthyPercentage = (project.unhealthyCount / totalEnvs) * 100;

  // Status dot classes
  const statusDots = {
    healthy: "bg-[#2e7d32]",
    degraded: "bg-[#e65100]",
    error: "bg-[#c62828]",
  };

  return (
    <div className="group bg-white border border-black/5 hover:border-[#d08873]/30 rounded-md p-4 hover:shadow-sm transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full shrink-0 ${statusDots[project.status]}`} />
          <h3 className="text-sm font-semibold text-[#1a1a1a] group-hover:text-[#d08873] transition-colors duration-200">
            {project.name}
          </h3>
        </div>
        <span className="bg-[#fdfcf9] border border-black/5 text-[#8a7f75] text-[11px] font-medium px-2 py-0.5 rounded-sm">
          {totalEnvs} Envs
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[#6b5e52] line-clamp-2 mb-3">
        {project.description}
      </p>

      {/* Repo / Branch tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="inline-flex items-center gap-1 bg-[#fdfcf9] text-[#8a7f75] text-[11px] font-medium px-2 py-0.5 rounded-sm border border-black/5">
          <FolderOpen size={10} className="text-[#8a7f75]" />
          {project.repo}
        </span>
        <span className="inline-flex items-center gap-1 bg-[#fdfcf9] text-[#8a7f75] text-[11px] font-medium px-2 py-0.5 rounded-sm border border-black/5">
          <GitBranch size={10} className="text-[#8a7f75]" />
          {project.branch}
        </span>
      </div>

      {/* Health Text & Bar */}
      <div className="mb-4">
        <div className="flex gap-2 text-[11px] font-medium text-[#8a7f75] mb-1.5">
          <span className="text-[#2e7d32]">{project.healthyCount} healthy</span>
          {project.unhealthyCount > 0 && (
            <span className={project.status === "error" ? "text-[#c62828]" : "text-[#e65100]"}>
              {project.unhealthyCount} unhealthy
            </span>
          )}
        </div>
        {/* Custom segment bar */}
        <div className="h-1 w-full bg-[#fdfcf9] border border-black/5 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-[#2e7d32] transition-all duration-500 ease-out"
            style={{ width: `${healthyPercentage}%` }}
          />
          {project.unhealthyCount > 0 && (
            <div
              className={`h-full transition-all duration-500 ease-out ${
                project.status === "error" ? "bg-[#c62828]" : "bg-[#e65100]"
              }`}
              style={{ width: `${unhealthyPercentage}%` }}
            />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-black/5 pt-3 flex justify-between items-center">
        <span className="text-[11px] font-medium text-[#8a7f75]">
          Last: {project.lastDeployment} &bull; {project.lastDeployedBy}
        </span>
        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-[#d08873] text-[11px] font-medium hover:gap-1.5 transition-all duration-200"
        >
          View
          <ArrowRight size={11} />
        </Link>
      </div>
    </div>
  );
};
