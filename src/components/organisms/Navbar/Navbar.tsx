"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchChange,
  searchPlaceholder = "Search Projects...",
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Create breadcrumbs dynamically based on path
  const pathSegments = pathname.split("/").filter(Boolean);

  const getBreadcrumbs = () => {
    if (pathSegments.length === 0) return [{ label: "Dashboard", href: "/dashboard" }];

    return pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      // Format segment name
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);
      if (label === "Dashboard") label = "Overview";
      return { label, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 border-b border-black/5 bg-white flex items-center justify-between px-5 sticky top-0 z-40">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 select-none">
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

        {/* Render "Admin" tag if on top-level pages */}
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

      {/* Quick Action button */}
      <div>
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={14} className="stroke-[3]" />}
          className="text-xs cursor-pointer"
          width="w-auto"
        >
          Quick Action
        </Button>
      </div>
    </header>
  );
};
