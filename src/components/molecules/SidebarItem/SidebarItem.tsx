"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ href, label, icon }) => {
  const pathname = usePathname();

  // Check if current route is active. Match subroutes too (e.g. /projects/harbor-api matches /projects)
  const isActive =
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3.5 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ease-out transform active:scale-98 ${
        isActive
          ? "bg-primary text-white shadow-sm shadow-primary/25 translate-x-1"
          : "text-text-muted hover:text-text-dark hover:bg-primary-light/40 hover:translate-x-1"
      }`}
    >
      <span
        className={`transition-colors duration-300 ${
          isActive
            ? "text-white"
            : "text-text-light group-hover:text-primary"
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
};
