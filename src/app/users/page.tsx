"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Mail, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { Badge } from "@/components/atoms/Badge/Badge";
import { DataTable } from "@/components/organisms/DataTable/DataTable";
import { CreateUserModal } from "@/components/organisms/CreateUserModal/CreateUserModal";
import { ViewUserModal } from "@/components/organisms/ViewUserModal/ViewUserModal";
import { useToast } from "@/components/atoms/Toast/Toast";
import { userService } from "@/services/user_service";
import { authService } from "@/services/auth_service";

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
  github_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  teams?: { id: string; teamName: string }[];
}

const INITIAL_MEMBERS: Member[] = [];

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.list();
      
      const mappedMembers: Member[] = data.map((user: any, index: number) => {
        const colors = ["bg-[#d08873]", "bg-[#8e7a6f]", "bg-[#a89587]", "bg-[#beab9d]", "bg-[#cfbeab]"];
        const bgColor = colors[index % colors.length];
        const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "U";
        
        let roleName = "Engineer";
        if (user.role && typeof user.role === 'string') {
          roleName = user.role;
        } else if (user.role && user.role.name) {
          roleName = user.role.name;
        } else if (user.role_name) {
          roleName = user.role_name;
        }
        
        return {
          id: user.id,
          name: user.name,
          initials: initials,
          email: user.email,
          role: roleName as any, 
          projects: user.projects || [],
          lastActive: "Now",
          status: user.is_active ? "Active" : "Pending",
          bgColor: bgColor,
          role_id: user.role_id,
          github_username: user.github_username,
          requires_github_access: user.requires_github_access,
          github_verified: user.github_verified,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
          teams: user.teams || []
        };
      });
      setMembers(mappedMembers);
    } catch (err: any) {
      toast("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleCreateUser = async (newUser: {
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    github_username?: string;
    requires_github_access: boolean;
  }) => {
    try {
      await authService.register({
        name: newUser.name,
        email: newUser.email,
        role_id: newUser.role_id,
        github_username: newUser.github_username || "",
        requires_github_access: newUser.requires_github_access
      });

      toast("User created successfully!");
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || "Failed to create user";
      toast(errMsg);
    }
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
        const roleColors: Record<string, string> = {
          Admin: "bg-[#faf1ee] text-[#d08873]",
          Engineer: "bg-[#edf4fc] text-[#1976d2]",
          DevOps: "bg-[#f4edf6] text-[#7b1fa2]",
          Viewer: "bg-[#f5f5f5] text-[#616161]",
        };
        const colorClass = roleColors[row.role] || "bg-[#f5f5f5] text-[#616161]";
        return (
          <span className={`${colorClass} text-[11px] font-semibold px-2 py-0.5 rounded-sm`}>
            {row.role}
          </span>
        );
      },
    },
    {
      header: "Created At",
      accessor: "created_at" as keyof Member,
      renderCell: (row: Member) => (
        <span className="text-sm text-[#6b5e52]">
          {row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
        </span>
      ),
    },
    {
      header: "Updated At",
      accessor: "updated_at" as keyof Member,
      renderCell: (row: Member) => (
        <span className="text-sm text-[#8a7f75]">
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
        </span>
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
            onClick={async () => {
              try {
                const fullUser = await userService.getByID(row.id);
                setSelectedUser({ ...row, projects: fullUser.projects, teams: fullUser.teams });
                setIsViewModalOpen(true);
              } catch (err: any) {
                const errMsg = err.response?.data?.error || err.message || "Failed to load user details";
                toast(errMsg);
              }
            }}
          >
            View
          </Button>
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
              className="px-2.5 py-1 text-xs text-[#c62828] hover:bg-[#ffebee] border border-[#c62828] hover:border-[#c62828] rounded-md cursor-pointer"
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
          className="px-2.5 py-1 text-xs text-[#c62828] hover:bg-[#ffebee] border border-[#c62828] hover:border-[#c62828] rounded-md cursor-pointer"
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
        {isLoading ? (
          <div className="flex flex-col gap-2 animate-pulse">
            {/* Skeleton header */}
            <div className="flex gap-4 pb-2 border-b border-black/5">
              {[2, 1.5, 1, 1, 1, 0.8].map((w, i) => (
                <div key={i} className="h-3 bg-[#ede7e0] rounded" style={{ flex: w }} />
              ))}
            </div>
            {/* Skeleton rows */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 py-2.5 border-b border-black/5 items-center">
                <div className="flex items-center gap-2.5" style={{ flex: 2 }}>
                  <div className="h-8 w-8 rounded-full bg-[#ede7e0] shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-2.5 bg-[#ede7e0] rounded w-3/4" />
                    <div className="h-2 bg-[#ede7e0] rounded w-1/2" />
                  </div>
                </div>
                {[1.5, 1, 1, 1, 0.8].map((w, j) => (
                  <div key={j} className="h-2.5 bg-[#ede7e0] rounded" style={{ flex: w }} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DataTable columns={activeColumns} data={activeMembers} pageSize={10} />
        )}
      </div>

      {/* Pending Users Table Container */}
      <div className="bg-white border border-black/5 rounded-md p-4">
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-4 select-none">
          Pending Users
        </h2>
        {isLoading ? (
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="flex gap-4 pb-2 border-b border-black/5">
              {[2, 1.5, 1, 1, 1, 0.8].map((w, i) => (
                <div key={i} className="h-3 bg-[#ede7e0] rounded" style={{ flex: w }} />
              ))}
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-2.5 border-b border-black/5 items-center">
                <div className="flex items-center gap-2.5" style={{ flex: 2 }}>
                  <div className="h-8 w-8 rounded-full bg-[#ede7e0] shrink-0" />
                  <div className="h-2.5 bg-[#ede7e0] rounded w-1/2 flex-1" />
                </div>
                {[1.5, 1, 1, 1, 0.8].map((w, j) => (
                  <div key={j} className="h-2.5 bg-[#ede7e0] rounded" style={{ flex: w }} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={pendingColumns}
            data={pendingMembers}
            pageSize={10}
            emptyStateText="No pending user invites"
          />
        )}
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* View User Modal */}
      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />
    </AppLayout>
  );
}
