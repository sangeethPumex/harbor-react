"use client";

import React from "react";
import { Users, UserPlus } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";

export default function UsersPage() {
  return (
    <AppLayout searchPlaceholder="Search users...">
      <div className="flex justify-between items-center mb-6 select-none animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-text-dark tracking-tight">
            Users
          </h1>
          <p className="text-xs font-semibold text-text-light mt-1">
            Manage roles, team permissions, and workspace access.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={<UserPlus size={14} className="stroke-[3]" />}
          className="bg-primary text-white border-0 text-xs h-9.5 px-4 font-bold shadow-sm shadow-primary/20 cursor-pointer"
        >
          Add User
        </Button>
      </div>

      <div className="bg-white border border-border-warm rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-xs select-none animate-scale-in">
        <div className="h-12 w-12 rounded-2xl bg-primary-light/45 flex items-center justify-center text-primary mb-4">
          <Users size={24} />
        </div>
        <p className="text-sm font-extrabold text-text-dark">User Management Portal</p>
        <p className="text-xs text-text-light font-medium mt-1.5 max-w-sm">
          Here you will be able to manage user credentials, invite new developers, and configure fine-grained role permissions.
        </p>
      </div>
    </AppLayout>
  );
}
