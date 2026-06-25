"use client";

import React, { useState } from "react";
import { UserPlus, Mail, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable } from "@/components/organisms/DataTable/DataTable";
import { CreateUserModal } from "@/components/organisms/CreateUserModal/CreateUserModal";
import { useToast } from "@/components/atoms/Toast/Toast";

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 14,
  className = "",
}) => (
  <svg
    height={size}
    width={size}
    viewBox="0 0 16 16"
    version="1.1"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

interface Member {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: "Admin" | "Engineer" | "DevOps" | "Viewer";
  projects: string;
  lastActive: string;
  status: "Active" | "Pending";
  bgColor: string;
  role_id?: string;
  github_username?: string;
  requires_github_access?: boolean;
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Admin",
    initials: "A",
    email: "admin@harbor.com",
    role: "Admin",
    projects: "All (6)",
    lastActive: "Now",
    status: "Active",
    bgColor: "bg-[#d08873]",
  },
  {
    id: "2",
    name: "Ava S.",
    initials: "AS",
    email: "ava@ocean.com",
    role: "Engineer",
    projects: "ocean-api, ocean-frontend",
    lastActive: "1 hour ago",
    status: "Active",
    bgColor: "bg-[#8e7a6f]",
  },
  {
    id: "3",
    name: "Emma R.",
    initials: "ER",
    email: "emma@sonic.com",
    role: "Engineer",
    projects: "Sonic API, Sonic Frontend",
    lastActive: "moments ago",
    status: "Active",
    bgColor: "bg-[#a89587]",
  },
  {
    id: "4",
    name: "Noah P.",
    initials: "NP",
    email: "noah@sonic.com",
    role: "Engineer",
    projects: "Sonic API, Sonic Frontend",
    lastActive: "moments ago",
    status: "Active",
    bgColor: "bg-[#beab9d]",
  },
  {
    id: "5",
    name: "Sophia L.",
    initials: "SL",
    email: "sophia@sonic.com",
    role: "DevOps",
    projects: "Sonic API, Sonic Frontend",
    lastActive: "moments ago",
    status: "Active",
    bgColor: "bg-[#cfbeab]",
  },
];

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    // Create a new pending member
    const newMember: Member = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      initials: inviteEmail.substring(0, 2).toUpperCase(),
      email: inviteEmail,
      role: "Viewer",
      projects: "None",
      lastActive: "Never",
      status: "Pending",
      bgColor: "bg-gray-400",
      requires_github_access: false,
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    toast("Pending invite sent successfully!");
  };

  const handleCreateUser = (newUser: {
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    github_username?: string;
    requires_github_access: boolean;
  }) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name: newUser.name,
      initials: newUser.name.substring(0, 2).toUpperCase(),
      email: newUser.email,
      role: newUser.role_name as Member["role"],
      projects: "None",
      lastActive: "Never",
      status: "Pending",
      bgColor: "bg-[#dfd0be]",
      role_id: newUser.role_id,
      github_username: newUser.github_username,
      requires_github_access: newUser.requires_github_access,
    };

    setMembers([...members, newMember]);
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    toast("Member removed successfully.");
  };

  const handleRoleChange = (id: string, newRole: Member["role"]) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
  };

  const activeMembers = members.filter((m) => m.status === "Active");
  const pendingMembers = members.filter((m) => m.status === "Pending");

  const activeCount = activeMembers.length;
  const pendingCount = pendingMembers.length;

  const activeColumns = [
    {
      header: "Member",
      accessor: "name" as keyof Member,
      renderCell: (row: Member) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${row.bgColor}`}
          >
            {row.initials}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[#1a1a1a] text-sm">
              {row.name}
            </span>
            {row.role === "Admin" && (
              <span className="text-[10px] text-[#8a7f75] font-medium leading-none mt-0.5">
                You
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email" as keyof Member,
      renderCell: (row: Member) => (
        <span className="text-sm text-[#6b5e52]">{row.email}</span>
      ),
    },
    {
      header: "Role",
      accessor: "role" as keyof Member,
      renderCell: (row: Member) => {
        if (row.role === "Admin") {
          return (
            <span className="bg-[#faf1ee] text-[#d08873] text-[11px] font-semibold px-2 py-0.5 rounded-sm">
              Admin
            </span>
          );
        }

        return (
          <div className="relative inline-block">
            <select
              value={row.role}
              onChange={(e) =>
                handleRoleChange(row.id, e.target.value as Member["role"])
              }
              className="appearance-none bg-white border border-black/5 text-sm text-[#2b2622] py-1 pl-2.5 pr-7 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer"
            >
              <option value="Engineer">Engineer</option>
              <option value="DevOps">DevOps</option>
              <option value="Viewer">Viewer</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-[#8a7f75]">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        );
      },
    },
    {
      header: "Projects",
      accessor: "projects" as keyof Member,
      renderCell: (row: Member) => (
        <span className="text-sm text-[#6b5e52]">{row.projects}</span>
      ),
    },
    {
      header: "Last Active",
      accessor: "lastActive" as keyof Member,
      renderCell: (row: Member) => (
        <span className="text-sm text-[#8a7f75]">{row.lastActive}</span>
      ),
    },
    {
      header: "Status",
      accessor: "status" as keyof Member,
      renderCell: (row: Member) => (
        <Badge
          variant="success"
          showDot={false}
          className="text-xs font-medium rounded-sm px-2 py-0.5"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as keyof Member,
      renderCell: (row: Member) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            className="px-2.5 py-1 text-xs border border-black/5 rounded-md hover:bg-[#faf9f8] cursor-pointer"
            width="w-auto"
          >
            Edit
          </Button>
          {row.role !== "Admin" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDeleteMember(row.id)}
              className="px-2.5 py-1 text-xs text-[#c62828] hover:bg-[#ffebee] border border-[#c62828]/20 hover:border-[#c62828]/40 rounded-md cursor-pointer"
              width="w-auto"
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pendingColumns = [
    {
      header: "Member",
      accessor: "name" as keyof Member,
      renderCell: (row: Member) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${row.bgColor}`}
          >
            {row.initials}
          </div>
          <span className="font-semibold text-[#1a1a1a] text-sm">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email" as keyof Member,
      renderCell: (row: Member) => (
        <span className="text-sm text-[#6b5e52]">{row.email}</span>
      ),
    },
    {
      header: "Role",
      accessor: "role" as keyof Member,
      renderCell: (row: Member) => (
        <span className="bg-[#fdfcf9] border border-black/5 text-[#8a7f75] text-[11px] font-semibold px-2 py-0.5 rounded-sm">
          {row.role}
        </span>
      ),
    },
    {
      header: "GitHub Username",
      accessor: "github_username" as keyof Member,
      renderCell: (row: Member) => {
        if (row.requires_github_access && row.github_username) {
          return (
            <span className="text-sm text-[#2b2622] flex items-center gap-1.5">
              <GithubIcon size={12} className="text-[#8a7f75]" />
              {row.github_username}
            </span>
          );
        }
        return <span className="text-sm text-[#8a7f75] italic">N/A</span>;
      },
    },
    {
      header: "GitHub Access",
      accessor: "requires_github_access" as keyof Member,
      renderCell: (row: Member) => (
        <Badge
          variant={row.requires_github_access ? "success" : "neutral"}
          showDot={false}
          className="text-xs font-medium rounded-sm px-2 py-0.5"
        >
          {row.requires_github_access ? "Required" : "Not Required"}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status" as keyof Member,
      renderCell: (row: Member) => (
        <Badge
          variant="warning"
          showDot={false}
          className="text-xs font-medium rounded-sm px-2 py-0.5"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as keyof Member,
      renderCell: (row: Member) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleDeleteMember(row.id)}
          className="px-2.5 py-1 text-xs text-[#c62828] hover:bg-[#ffebee] border border-[#c62828]/20 hover:border-[#c62828]/40 rounded-md cursor-pointer"
          width="w-auto"
        >
          Cancel Invite
        </Button>
      ),
    },
  ];

  return (
    <AppLayout searchPlaceholder="Search members...">
      {/* Page Heading */}
      <div className="flex justify-between items-center mb-5 select-none animate-fade-in">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#1a1a1a]">
            Team Members
          </h1>
          <p className="text-sm text-[#6b5e52] mt-1">
            {activeCount} members · {pendingCount} pending invites
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={<UserPlus size={14} />}
          onClick={() => setIsCreateModalOpen(true)}
          className="cursor-pointer font-medium border border-black/5 hover:bg-[#faf9f8] text-sm text-[#2b2622]"
          width="w-auto"
        >
          Add New Member
        </Button>
      </div>

      {/* Active Members Table Container */}
      <div className="bg-white border border-black/5 rounded-md p-4 mb-6">
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
          Active Members
        </h2>
        <DataTable columns={activeColumns} data={activeMembers} pageSize={10} />
      </div>

      {/* Pending Users Table Container */}
      <div className="bg-white border border-black/5 rounded-md p-4">
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
          Pending Users
        </h2>
        <DataTable
          columns={pendingColumns}
          data={pendingMembers}
          pageSize={10}
          emptyStateText="No pending user invites"
        />
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />
    </AppLayout>
  );
}
