"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, Mail, Calendar, Shield, Users, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/atoms/Badge/Badge";

const GithubIcon: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = "" }) => (
  <svg
    height={size}
    width={size}
    viewBox="0 0 16 16"
    version="1.1"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!isOpen || !mounted || !user) return null;

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Never") return dateString;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center select-none bg-[#fdfcf9]">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${user.bgColor || 'bg-[#d08873]'}`}
            >
              {user.initials || user.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1a1a1a]">{user.name}</h2>
              <p className="text-xs text-[#8a7f75]">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a7f75] hover:text-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0 bg-white">
          <div className="flex flex-col gap-6">
            
            {/* Basic Details */}
            <div>
              <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <User size={14} className="text-[#8a7f75]" />
                Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-black/5 bg-[#fdfcf9] rounded-md p-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#8a7f75] block mb-1">Email Address</span>
                  <div className="flex items-center gap-2 text-sm text-[#2b2622]">
                    <Mail size={14} className="text-[#8a7f75]" />
                    {user.email}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8a7f75] block mb-1">Role</span>
                  <div className="flex items-center gap-2 text-sm text-[#2b2622]">
                    <Shield size={14} className="text-[#8a7f75]" />
                    {user.role}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8a7f75] block mb-1">Status</span>
                  <Badge variant={user.status === "Active" || user.is_active ? "success" : "warning"} showDot={false} className="text-[11px] px-2 py-0.5 rounded-sm">
                    {user.status || (user.is_active ? "Active" : "Inactive")}
                  </Badge>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8a7f75] block mb-1">Created At</span>
                  <div className="flex items-center gap-2 text-sm text-[#2b2622]">
                    <Calendar size={14} className="text-[#8a7f75]" />
                    {formatDate(user.created_at || new Date().toISOString())}
                  </div>
                </div>
              </div>
            </div>

            {/* GitHub Details */}
            {(user.github_username || user.requires_github_access) && (
              <div>
                <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <GithubIcon size={14} className="text-[#8a7f75]" />
                  GitHub Integration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-black/5 bg-[#fdfcf9] rounded-md p-4">
                  <div>
                    <span className="text-[11px] font-semibold text-[#8a7f75] block mb-1">GitHub Username</span>
                    <span className="text-sm text-[#2b2622]">{user.github_username || "Not linked"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#8a7f75] block mb-1">Verification Status</span>
                    {user.github_verified ? (
                      <Badge variant="success" showDot={false} className="text-[11px] px-2 py-0.5 rounded-sm">Verified</Badge>
                    ) : (
                      <Badge variant="warning" showDot={false} className="text-[11px] px-2 py-0.5 rounded-sm">Pending Verification</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Teams & Projects */}
            <div>
              <h3 className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Briefcase size={14} className="text-[#8a7f75]" />
                Teams & Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-black/5 bg-[#fdfcf9] rounded-md p-4">
                <div>
                  <span className="text-[11px] font-semibold text-[#8a7f75] block mb-2 flex items-center gap-1.5">
                    <Users size={12} /> Teams
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(user.teams) && user.teams.length > 0 ? (
                      user.teams.map((team: any, idx: number) => (
                         <span key={team.id || idx} className="bg-white border border-black/5 text-[#2b2622] text-xs px-2 py-1 rounded-md shadow-sm">
                           {team.teamName || team}
                         </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#8a7f75] italic">No teams assigned</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-[#8a7f75] block mb-2 flex items-center gap-1.5">
                    <Briefcase size={12} /> Projects
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(user.projects) && user.projects.length > 0 ? (
                      user.projects.map((project: any, idx: number) => (
                         <span key={project.id || idx} className="bg-white border border-black/5 text-[#2b2622] text-xs px-2 py-1 rounded-md shadow-sm">
                           {project.project_name || project}
                         </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#8a7f75] italic">
                        {typeof user.projects === 'string' && user.projects !== "None" ? user.projects : "No projects assigned"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
