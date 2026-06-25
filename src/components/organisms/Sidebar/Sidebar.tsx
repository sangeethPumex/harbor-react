"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  History as HistoryIcon,
  Users,
  Users2,
  Settings as SettingsIcon,
  Bell,
  PanelRightOpen,
  ChevronDown,
  LogOut,
} from "lucide-react";

const MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/team", label: "Team", icon: Users2 },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/users", label: "Users", icon: Users },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  return (
    <div
      className={`
        h-screen flex flex-col transition-all duration-300 select-none
        bg-[#fdfcf9]
        border-r border-black/5
        sticky top-0 z-50 shrink-0
        ${collapsed ? "w-16" : "w-60"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-black/5 h-16 shrink-0">
        <div className="flex items-center gap-2.5 select-none">
          <img src="/harbor-mini.svg" alt="Harbor Icon" className="h-7 w-auto animate-fade-in" />
          {!collapsed && (
            <span className="font-extrabold text-[15px] tracking-tight text-[#1a1a1a] animate-fade-in">
              Harbor
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-black/5 rounded-md transition cursor-pointer"
        >
          <PanelRightOpen
            size={16}
            className={`text-[#6b5e52] transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-sm cursor-pointer
                transition-all duration-150
                ${isActive ? "bg-[rgba(208,136,115,0.08)]" : "hover:bg-[#f4f2ef]"}
              `}
            >
              <Icon
                size={20}
                strokeWidth={2.2}
                className={`flex-shrink-0 ${isActive ? "text-primary" : "text-[#6f645a]"}`}
              />

              {!collapsed && (
                <span
                  className={`text-[14px] flex-1 ${
                    isActive ? "text-[#1a1a1a] font-semibold" : "text-[#3f372f] font-medium"
                  }`}
                >
                  {item.label}
                </span>
              )}

              {/* Tooltip on collapse hover */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 text-xs bg-[#2b2622] text-white rounded-md opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER PROFILE */}
      <div className="border-t border-black/5 px-3 py-3 relative">
        <div onClick={() => setShowLogout(!showLogout)} className="cursor-pointer group">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              {/* Avatar with custom gradient */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-white transition-transform group-hover:scale-105 shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(208,136,115,0.9),transparent_60%),radial-gradient(circle_at_30%_70%,rgba(142,122,111,1),rgba(110,93,83,1))]" />
                <span className="relative z-10">A</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#1a1a1a] truncate" title="Admin">
                  Admin
                </p>
                <p className="text-[10px] text-[#8a7f75] truncate" title="admin@harbor.com">
                  admin@harbor.com
                </p>
                <p className="text-[11px] font-medium text-primary/70 truncate" title="Workspace">
                  Workspace
                </p>
              </div>

              <ChevronDown
                size={14}
                className={`text-[#8a7f75] transition-transform ${showLogout ? "rotate-180" : ""}`}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-white transition-transform group-hover:scale-105">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(208,136,115,0.9),transparent_60%),radial-gradient(circle_at_30%_70%,rgba(142,122,111,1),rgba(110,93,83,1))]" />
                <span className="relative z-10">A</span>
              </div>
            </div>
          )}
        </div>

        {/* Logout Popover */}
        {showLogout && (
          <div
            className="absolute bottom-full mb-2 left-3 right-3 bg-white rounded-md shadow-lg border border-black/5 p-1 z-50"
          >
            <button
              onClick={() => {
                localStorage.removeItem("harbor_logged_in");
                window.location.href = "/login";
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer font-bold"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
