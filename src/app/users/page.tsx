"use client";

import React, { useState } from "react";
import { UserPlus, Search, Edit2, Trash2, Mail } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable } from "@/components/organisms/DataTable/DataTable";

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
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleRoleChange = (id: string, newRole: Member["role"]) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, role: newRole } : m))
    );
  };

  const activeCount = members.filter((m) => m.status === "Active").length;
  const pendingCount = members.filter((m) => m.status === "Pending").length;

  const columns = [
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
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
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
          variant={row.status === "Active" ? "success" : "warning"}
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
          className="cursor-pointer font-medium border border-black/5 hover:bg-[#faf9f8] text-sm text-[#2b2622]"
          width="w-auto"
        >
          Add New Member
        </Button>
      </div>

      {/* Invite Component */}
      {isInviteOpen && (
        <form
          onSubmit={handleSendInvite}
          className="mb-5 bg-[#fbf5f2] border border-[#d08873]/15 rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up"
        >
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-[#1a1a1a]">
              Invite a new team member to view
            </h3>
            <p className="text-xs text-[#6b5e52] mt-0.5">
              They'll receive an email to set up their account and PIN.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-64">
              <InputField
                type="email"
                placeholder="colleague@harbor.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                iconLeft={<Mail size={14} className="text-[#8a7f75]" />}
                className="bg-white text-xs h-9"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="text-xs h-9 cursor-pointer"
              width="w-auto"
            >
              Send Invite
            </Button>
          </div>
        </form>
      )}

      {/* Table Container */}
      <div className="bg-white border border-black/5 rounded-md p-4">
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
          Active Members
        </h2>
        <DataTable columns={columns} data={members} pageSize={10} />
      </div>
    </AppLayout>
  );
}
