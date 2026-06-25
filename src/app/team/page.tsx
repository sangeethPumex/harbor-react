"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Badge } from "@/components/atoms/Badge/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Layout, FolderKanban, Users, ExternalLink, Code2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button/Button";
import { CreateTeamModal } from "@/components/organisms/CreateTeamModal/CreateTeamModal";

interface Member {
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
  email: string;
}

interface TeamProject {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "error";
  description: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  bgGradient: string;
  members: Member[];
  projects: TeamProject[];
}

const TEAMS_DATA: Team[] = [
  {
    id: "platform-eng",
    name: "Platform Engineering",
    description: "Responsible for developer tooling, core cloud infrastructures, deployment automation, and service reliability.",
    icon: <Shield className="h-5 w-5" />,
    accentColor: "#d08873",
    bgGradient: "from-[#faf1ee] to-[#fbf5f2]",
    members: [
      { name: "Admin User", initials: "AU", role: "Lead DevOps", avatarColor: "bg-[#d08873]", email: "admin@harbor.com" },
      { name: "Ava S.", initials: "AS", role: "Cloud Engineer", avatarColor: "bg-[#8e7a6f]", email: "ava@ocean.com" },
      { name: "Ravi Aven", initials: "RA", role: "Kubernetes Architect", avatarColor: "bg-[#a89587]", email: "ravi@harbor.com" },
    ],
    projects: [
      { id: "harbor-api", name: "harbor-api", status: "healthy", description: "Go backend service for Harbor portal" },
      { id: "terraform-aws-vpc", name: "terraform-aws-vpc", status: "healthy", description: "AWS VPC infrastructure via Terraform" },
    ],
  },
  {
    id: "product-delivery",
    name: "Product Delivery",
    description: "Focuses on user-facing applications, dashboard features, notification systems, and client interfaces.",
    icon: <Layout className="h-5 w-5" />,
    accentColor: "#8e7a6f",
    bgGradient: "from-[#f4f2ef] to-[#faf9f8]",
    members: [
      { name: "Emma R.", initials: "ER", role: "Frontend Lead", avatarColor: "bg-[#beab9d]", email: "emma@sonic.com" },
      { name: "Noah P.", initials: "NP", role: "React Developer", avatarColor: "bg-[#cfbeab]", email: "noah@sonic.com" },
      { name: "Luna Valen", initials: "LV", role: "UX Designer", avatarColor: "bg-[#dfd0be]", email: "luna@vortex.com" },
      { name: "Priya S.", initials: "PS", role: "QA Engineer", avatarColor: "bg-[#d08873]", email: "priya@harbor.com" },
    ],
    projects: [
      { id: "harbor-frontend", name: "harbor-frontend", status: "degraded", description: "Angular frontend application" },
      { id: "notification-worker", name: "notification-worker", status: "error", description: "Slack & email notification worker" },
    ],
  },
  {
    id: "core-architecture",
    name: "Core Architecture",
    description: "Designs the overall microservice topology, authorization structures, database models, and data streams.",
    icon: <Code2 className="h-5 w-5" />,
    accentColor: "#a89587",
    bgGradient: "from-[#f0ede9] to-[#f7f5f2]",
    members: [
      { name: "Sophia L.", initials: "SL", role: "Principal Architect", avatarColor: "bg-[#8e7a6f]", email: "sophia@sonic.com" },
      { name: "Chen W.", initials: "CW", role: "SecOps Specialist", avatarColor: "bg-[#beab9d]", email: "chen@harbor.com" },
      { name: "Alex K.", initials: "AK", role: "Data Engineer", avatarColor: "bg-[#dfd0be]", email: "alex@harbor.com" },
    ],
    projects: [
      { id: "auth-service", name: "auth-service", status: "healthy", description: "OAuth2 & RBAC microservice" },
      { id: "data-pipeline", name: "data-pipeline", status: "healthy", description: "ETL pipeline for analytics reporting" },
    ],
  },
];

const ALL_MOCK_MEMBERS = [
  { id: "8a71fd85-cca8-4329-a4f1-eb1c65f142a8", name: "Admin User", initials: "AU", role: "Lead DevOps", avatarColor: "bg-[#d08873]" },
  { id: "9fb56ea3-6912-4451-9644-3d5ea9e3db4d", name: "Ava S.", initials: "AS", role: "Cloud Engineer", avatarColor: "bg-[#8e7a6f]" },
  { id: "a871fd85-cca8-4329-a4f1-eb1c65f142a2", name: "Ravi Aven", initials: "RA", role: "Kubernetes Architect", avatarColor: "bg-[#a89587]" },
  { id: "b871fd85-cca8-4329-a4f1-eb1c65f142a3", name: "Emma R.", initials: "ER", role: "Frontend Lead", avatarColor: "bg-[#beab9d]" },
  { id: "c871fd85-cca8-4329-a4f1-eb1c65f142a4", name: "Noah P.", initials: "NP", role: "React Developer", avatarColor: "bg-[#cfbeab]" },
  { id: "d871fd85-cca8-4329-a4f1-eb1c65f142a5", name: "Luna Valen", initials: "LV", role: "UX Designer", avatarColor: "bg-[#dfd0be]" },
  { id: "e871fd85-cca8-4329-a4f1-eb1c65f142a6", name: "Priya S.", initials: "PS", role: "QA Engineer", avatarColor: "bg-[#d08873]" },
  { id: "f871fd85-cca8-4329-a4f1-eb1c65f142a7", name: "Sophia L.", initials: "SL", role: "Principal Architect", avatarColor: "bg-[#8e7a6f]" },
  { id: "g871fd85-cca8-4329-a4f1-eb1c65f142a8", name: "Chen W.", initials: "CW", role: "SecOps Specialist", avatarColor: "bg-[#beab9d]" },
  { id: "h871fd85-cca8-4329-a4f1-eb1c65f142a9", name: "Alex K.", initials: "AK", role: "Data Engineer", avatarColor: "bg-[#dfd0be]" },
];

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>(TEAMS_DATA);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>("platform-eng");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleCreateTeam = (newTeam: {
    name: string;
    description: string;
    teamLeadID: string;
    teamMembersIDs: string[];
  }) => {
    const lead = ALL_MOCK_MEMBERS.find((m) => m.id === newTeam.teamLeadID);
    const members = ALL_MOCK_MEMBERS.filter((m) => newTeam.teamMembersIDs.includes(m.id));

    const detailedMembers: Member[] = [];
    if (lead) {
      detailedMembers.push({
        name: lead.name,
        initials: lead.initials,
        role: "Team Lead",
        avatarColor: lead.avatarColor,
        email: `${lead.name.toLowerCase().replace(/\s+/g, "")}@harbor.com`,
      });
    }

    members.forEach((m) => {
      if (m.id !== newTeam.teamLeadID) {
        detailedMembers.push({
          name: m.name,
          initials: m.initials,
          role: m.role,
          avatarColor: m.avatarColor,
          email: `${m.name.toLowerCase().replace(/\s+/g, "")}@harbor.com`,
        });
      }
    });

    const newTeamItem: Team = {
      id: newTeam.name.toLowerCase().replace(/\s+/g, "-"),
      name: newTeam.name,
      description: newTeam.description,
      icon: <Users className="h-5 w-5" />,
      accentColor: "#d08873",
      bgGradient: "from-[#faf1ee] to-[#fbf5f2]",
      members: detailedMembers,
      projects: [],
    };

    setTeams([...teams, newTeamItem]);
    setSelectedTeamId(newTeamItem.id);
  };

  return (
    <AppLayout searchPlaceholder="Search teams & resources...">
      {/* Heading */}
      <div className="flex justify-between items-center mb-6 select-none animate-fade-in">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#1a1a1a]">
            Teams & Structure
          </h1>
          <p className="text-sm text-[#6b5e52] mt-1">
            Explore organization structures, member mappings, and project ownership
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={14} />}
          onClick={() => setIsCreateModalOpen(true)}
          className="cursor-pointer font-medium border border-black/5 hover:bg-[#faf9f8] text-sm text-[#2b2622]"
          width="w-auto"
        >
          New Team
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none items-start">
        {/* Left Column: Teams List Cards */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {teams.map((team) => {
            const isSelected = selectedTeamId === team.id;
            return (
              <motion.div
                key={team.id}
                layoutId={`team-card-${team.id}`}
                onClick={() => setSelectedTeamId(team.id)}
                className={`cursor-pointer rounded-md border border-black/5 bg-gradient-to-br ${team.bgGradient} p-5 transition-all duration-200 ${
                  isSelected 
                    ? "ring-2 ring-[#d08873] shadow-md" 
                    : "hover:scale-[1.01] hover:shadow-sm"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div 
                      className="h-10 w-10 rounded-md flex items-center justify-center text-white"
                      style={{ backgroundColor: team.accentColor }}
                    >
                      {team.icon}
                    </div>

                    <div className="flex flex-col">
                      <h3 className="text-base font-semibold text-[#1a1a1a]">{team.name}</h3>
                      <span className="text-xs text-[#8a7f75] font-medium mt-0.5">{team.members.length} members &bull; {team.projects.length} projects</span>
                    </div>
                  </div>

                  <div className="flex -space-x-2.5">
                    {team.members.slice(0, 3).map((m, idx) => (
                      <div
                        key={idx}
                        className={`h-7 w-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold ${m.avatarColor}`}
                        title={m.name}
                      >
                        {m.initials}
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <div className="h-7 w-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold">
                        +{team.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[#6b5e52] leading-relaxed mt-3.5 pr-4">
                  {team.description}
                </p>

                {/* Linked projects row */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {team.projects.map((p) => (
                    <span 
                      key={p.id}
                      className="bg-white/80 border border-black/5 px-2 py-0.5 rounded-sm text-[10px] font-medium text-[#6b5e52] flex items-center gap-1.5"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        p.status === "healthy" 
                          ? "bg-green-500" 
                          : p.status === "degraded" 
                          ? "bg-yellow-500" 
                          : "bg-red-500"
                      }`} />
                      {p.name}
                    </span>
                  ))}
                  {team.projects.length === 0 && (
                    <span className="text-[10px] text-[#8a7f75] italic">No projects linked yet</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Dynamic Detailed Team View */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTeam.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-black/5 rounded-md p-5 flex flex-col gap-6 shadow-sm min-h-[460px]"
            >
              {/* Detailed Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                <div 
                  className="h-10 w-10 rounded-md flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedTeam.accentColor }}
                >
                  {selectedTeam.icon}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-base font-bold text-[#1a1a1a]">{selectedTeam.name} Details</h2>
                  <span className="text-xs text-[#8a7f75]">Linked to secure Harbor resources</span>
                </div>
              </div>

              {/* Members Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a7f75] uppercase tracking-wider">
                  <Users size={13} />
                  <span>Team Roster ({selectedTeam.members.length})</span>
                </div>
                
                <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedTeam.members.map((m, idx) => (
                    <div 
                      key={idx}
                      className="flex justify-between items-center p-2 rounded-md border border-black/5 bg-[#fdfcf9] hover:bg-[#f4f2ef]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.avatarColor}`}>
                          {m.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#1a1a1a]">{m.name}</span>
                          <span className="text-[10px] text-[#8a7f75]">{m.email}</span>
                        </div>
                      </div>
                      <span className="bg-white border border-black/5 text-[#d08873] text-[9px] font-bold px-2 py-0.5 rounded-sm">
                        {m.role}
                      </span>
                    </div>
                  ))}
                  {selectedTeam.members.length === 0 && (
                    <span className="text-xs text-[#8a7f75] italic p-4 text-center">No members assigned</span>
                  )}
                </div>
              </div>

              {/* Linked Projects Section */}
              <div className="flex flex-col gap-3 border-t border-black/5 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8a7f75] uppercase tracking-wider">
                  <FolderKanban size={13} />
                  <span>Owned Projects ({selectedTeam.projects.length})</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {selectedTeam.projects.map((p) => (
                    <div 
                      key={p.id}
                      className="p-3 rounded-md border border-black/5 bg-gradient-to-br from-white to-[#fdfcf9] hover:shadow-xs transition-shadow flex items-start justify-between"
                    >
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-xs font-bold text-[#1a1a1a]">{p.name}</span>
                        <p className="text-[10px] text-[#6b5e52] leading-relaxed">{p.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          variant={
                            p.status === "healthy" 
                              ? "success" 
                              : p.status === "degraded" 
                              ? "warning" 
                              : "danger"
                          }
                          showDot={false}
                          className="text-[9px] font-bold rounded-sm px-1.5 py-0.2"
                        >
                          {p.status}
                        </Badge>
                        <Link 
                          href={`/projects`}
                          className="text-[9px] text-[#d08873] hover:underline flex items-center gap-0.5 mt-0.5"
                        >
                          <span>Manage</span>
                          <ExternalLink size={8} />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {selectedTeam.projects.length === 0 && (
                    <div className="p-4 border border-dashed border-black/10 rounded-md text-center text-xs text-[#8a7f75] italic">
                      No linked projects. Use the projects panel to link this team.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        existingTeams={teams}
        onCreate={handleCreateTeam}
      />
    </AppLayout>
  );
}
