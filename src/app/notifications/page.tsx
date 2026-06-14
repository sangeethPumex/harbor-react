"use client";

import React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";

export default function NotificationsPage() {
  return (
    <AppLayout searchPlaceholder="Search notifications...">
      <div className="flex justify-between items-center mb-6 select-none animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold text-text-dark tracking-tight">
            Notifications
          </h1>
          <p className="text-xs font-semibold text-text-light mt-1">
            Realtime alerts, build failure notices, and security updates.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          icon={<CheckCheck size={14} className="stroke-[3]" />}
          className="text-xs h-9.5 px-4 font-bold border-border-warm hover:border-primary/30 cursor-pointer"
        >
          Mark all read
        </Button>
      </div>

      <div className="bg-white border border-border-warm rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-xs select-none animate-scale-in">
        <div className="h-12 w-12 rounded-2xl bg-primary-light/45 flex items-center justify-center text-primary mb-4">
          <Bell size={24} />
        </div>
        <p className="text-sm font-extrabold text-text-dark">Notifications Feed</p>
        <p className="text-xs text-text-light font-medium mt-1.5 max-w-sm">
          All workspace events, deployment logs warnings, and security advisory notifications will appear in this list.
        </p>
      </div>
    </AppLayout>
  );
}
