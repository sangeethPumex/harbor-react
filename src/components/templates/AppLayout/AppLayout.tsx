"use client";

import React from "react";
import { Sidebar } from "@/components/organisms/Sidebar/Sidebar";
import { Navbar } from "@/components/organisms/Navbar/Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  searchPlaceholder,
  onSearchChange,
}) => {
  return (
    <div className="flex bg-[#fdfcf9] min-h-screen text-[#2b2622] font-sans animate-fade-in">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar
          searchPlaceholder={searchPlaceholder}
          onSearchChange={onSearchChange}
        />

        {/* Scrollable Workspace Pages */}
        <main className="flex-1 overflow-y-auto px-6 py-5 bg-[#fdfcf9] relative">
          <div className="max-w-7xl mx-auto w-full pb-12 animate-slide-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
