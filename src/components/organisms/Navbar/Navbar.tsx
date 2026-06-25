"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Plus, ArrowRight, FolderKanban, Users, Shield, Bell, History } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

const QUICK_ACTIONS = [
  { label: "New Project", href: "/projects", desc: "Spin up a new microservice", icon: <FolderKanban size={13} /> },
  { label: "Add Member", href: "/users", desc: "Invite new team members to Harbor", icon: <Users size={13} /> },
  { label: "Create Team", href: "/team", desc: "Configure resource access groups", icon: <Shield size={13} /> },
  { label: "System Alerts", href: "/notifications", desc: "Inspect cluster warnings & notices", icon: <Bell size={13} /> },
  { label: "Deploy Logs", href: "/history", desc: "Review complete build history", icon: <History size={13} /> },
];

export const Navbar: React.FC<NavbarProps> = ({
  onSearchChange,
  searchPlaceholder = "Search Projects...",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pathSegments = pathname.split("/").filter(Boolean);

  const getBreadcrumbs = () => {
    if (pathSegments.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];

    return pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (label === "Dashboard") label = "Overview";
      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const handleActionClick = (href: string) => {
    setIsDropdownOpen(false);
    router.push(href);
  };

  return (
    <header className="h-14 border-b border-black/5 bg-white flex items-center justify-between px-5 sticky top-0 z-40 select-none">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.href}>
              {idx > 0 && <span className="text-[#8a7f75]/60 font-medium text-sm">/</span>}
              {isLast ? (
                <span className="text-sm font-medium text-[#3a312a]">{crumb.label}</span>
              ) : (
                <span
                  onClick={() => router.push(crumb.href)}
                  className="text-sm font-medium text-[#8a7f75] hover:text-[#d08873] transition-colors cursor-pointer"
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}

        {/* Admin Tag */}
        {pathSegments.length <= 1 && (
          <span className="bg-[#faf9f8] text-[#8a7f75] text-[11px] font-medium px-1.5 py-0.5 rounded-md ml-1.5 border border-black/5">
            Admin
          </span>
        )}
      </div>

      {/* Central Search Box */}
      <div className="w-80 max-w-md">
        <InputField
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange?.(e.target.value)}
          iconLeft={<Search size={14} className="stroke-[2.5]" />}
        />
      </div>

      {/* Quick Action Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={14} className="stroke-[3]" />}
          className="text-xs cursor-pointer"
          width="w-auto"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          Quick Action
        </Button>

        {/* Dropdown Menu - Glassmorphic / Subtle */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-64 bg-white/60 backdrop-blur-lg border border-black/5 shadow-lg rounded-md z-50 overflow-hidden py-1.5"
            >
              <div className="px-3.5 py-1.5 border-b border-black/5">
                <span className="text-[10px] font-semibold text-[#8a7f75] uppercase tracking-wider">Quick Actions</span>
              </div>
              <div className="flex flex-col px-1.5 py-1">
                {QUICK_ACTIONS.map((action, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleActionClick(action.href)}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-sm hover:bg-[#fbf5f2] cursor-pointer transition-colors duration-150 group"
                  >
                    <div className="h-7 w-7 rounded-sm bg-[#fdfcf9] border border-black/5 flex items-center justify-center shrink-0 text-[#8a7f75] group-hover:text-[#d08873] group-hover:bg-white transition-colors">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-[#2b2622] group-hover:text-[#d08873] transition-colors">{action.label}</span>
                        <ArrowRight size={10} className="text-[#8a7f75] opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-2px] group-hover:translate-x-0" />
                      </div>
                      <p className="text-[10px] text-[#8a7f75] leading-normal truncate">{action.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
