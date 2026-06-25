"use client";

import React, { useState } from "react";
import { Bell, CheckCheck, AlertTriangle, CheckCircle2, ShieldAlert, Info, Trash2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/templates/AppLayout/AppLayout";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { Tabs, TabData } from "@/components/atoms/Tabs/Tabs";
import Link from "next/link";
import { useToast } from "@/components/atoms/Toast/Toast";

interface NotificationItem {
  id: string;
  type: "deployment_success" | "deployment_failed" | "security" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: "deployment_failed",
    title: "Deployment Failed",
    message: "Deployment #148 on lake-service (staging) failed during Rolling update ALB validation.",
    timestamp: "10m ago",
    isRead: false,
    link: "/deployments/148",
  },
  {
    id: "2",
    type: "security",
    title: "Vulnerability Advisory",
    message: "auth-service repository uses packages with known high severity vulnerabilities (CVE-2026-9812).",
    timestamp: "2h ago",
    isRead: false,
    link: "/settings",
  },
  {
    id: "3",
    type: "deployment_success",
    title: "Deployment Succeeded",
    message: "Deployment #145 on river-api (production) was successfully promoted and healthy.",
    timestamp: "5h ago",
    isRead: false,
    link: "/deployments/145",
  },
  {
    id: "4",
    type: "system",
    title: "Database Backup Completed",
    message: "Weekly automated backup forRDS PostgreSQL production instance completed successfully.",
    timestamp: "1d ago",
    isRead: true,
  },
  {
    id: "5",
    type: "deployment_success",
    title: "Deployment Succeeded",
    message: "Deployment #143 on harbor-api (uat) completed successfully in 3m 36s.",
    timestamp: "2d ago",
    isRead: true,
    link: "/deployments/143",
  },
];

type FilterType = "all" | "unread" | "deployments" | "security";

const FILTER_TABS: TabData[] = [
  ["all", "All"],
  ["unread", "Unread"],
  ["deployments", "Deployments"],
  ["security", "Security"],
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterType>("all");
  const { toast } = useToast();

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    toast("All notifications marked as read.");
  };

  const handleToggleRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
    toast("Notification deleted.");
  };

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "deployments") return n.type === "deployment_success" || n.type === "deployment_failed";
    if (activeTab === "security") return n.type === "security";
    return true; // all
  });

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "deployment_success":
        return <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />;
      case "deployment_failed":
        return <AlertTriangle className="h-4.5 w-4.5 text-red-600" />;
      case "security":
        return <ShieldAlert className="h-4.5 w-4.5 text-amber-600" />;
      case "system":
      default:
        return <Info className="h-4.5 w-4.5 text-[#8a7f75]" />;
    }
  };

  const getNotificationIconBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "deployment_success":
        return "bg-green-50 border-green-100";
      case "deployment_failed":
        return "bg-red-50 border-red-100";
      case "security":
        return "bg-amber-50 border-amber-100";
      case "system":
      default:
        return "bg-[#fdfcf9] border-black/5";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppLayout searchPlaceholder="Search alerts...">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 select-none animate-fade-in">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight text-[#1a1a1a]">
            Notifications
          </h1>
          <p className="text-xs text-[#6b5e52] mt-1">
            Realtime alerts, build failure notices, and security updates ({unreadCount} unread)
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="secondary"
            icon={<CheckCheck size={14} />}
            onClick={handleMarkAllRead}
            className="cursor-pointer font-medium border border-black/5 hover:bg-[#faf9f8] text-xs text-[#2b2622]"
            width="w-auto"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white border border-black/5 rounded-md p-3 mb-5 select-none justify-between items-center">
        <Tabs
          data={FILTER_TABS}
          activeTab={activeTab}
          setActiveTab={(val) => setActiveTab(val as FilterType)}
        />
      </div>

      {/* Notifications Feed */}
      <div className="flex flex-col gap-3 select-none">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleToggleRead(notif.id)}
              className={`flex items-start gap-4 p-4 rounded-md border transition-all duration-150 cursor-pointer ${
                notif.isRead
                  ? "bg-white border-black/5 hover:bg-[#faf9f8]"
                  : "bg-[#fdfcf9] border-[#d08873]/25 shadow-xs hover:border-[#d08873]/40"
              }`}
            >
              {/* Dot indicator */}
              <div className="pt-1.5 shrink-0">
                <span
                  className={`h-2 w-2 rounded-full block transition-all duration-300 ${
                    notif.isRead ? "bg-transparent" : "bg-[#d08873]"
                  }`}
                />
              </div>

              {/* Styled Icon */}
              <div className={`h-8 w-8 rounded-md border flex items-center justify-center shrink-0 ${getNotificationIconBg(notif.type)}`}>
                {getNotificationIcon(notif.type)}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-3">
                  <h3 className={`text-sm font-semibold ${notif.isRead ? "text-[#1a1a1a]" : "text-[#2b2622]"}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-[#8a7f75] shrink-0 font-medium">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-[#6b5e52] mt-1 leading-relaxed">{notif.message}</p>

                {/* Redirect Link */}
                {notif.link && (
                  <Link
                    href={notif.link}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#d08873] hover:underline mt-2.5"
                  >
                    <span>View details</span>
                    <ArrowRight size={10} />
                  </Link>
                )}
              </div>

              {/* Delete Action */}
              <button
                onClick={(e) => handleDelete(notif.id, e)}
                className="text-[#8a7f75] hover:text-[#c62828] transition-colors p-1 rounded-md hover:bg-black/5 shrink-0"
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white border border-black/5 rounded-md p-16 flex flex-col items-center justify-center text-center shadow-xs select-none animate-scale-in">
            <div className="h-12 w-12 rounded-full bg-[#fdfcf9] border border-black/5 flex items-center justify-center text-[#d08873] mb-4">
              <Bell size={20} />
            </div>
            <p className="text-sm font-semibold text-[#1a1a1a]">No notifications found</p>
            <p className="text-xs text-[#8a7f75] font-medium mt-1.5 max-w-xs leading-normal">
              No matching alerts or updates in this category. New events will appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
