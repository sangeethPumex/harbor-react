"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Check, User, Mail, Loader2, UserLock, Shield } from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/atoms/Toast/Toast";
import { githubService } from "@/services/github_service";
import { userService } from "@/services/user_service";

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

export interface EditUserModalUser {
  id: string;
  name: string;
  email: string;
  role_id?: string;
  github_username?: string;
  requires_github_access?: boolean;
  github_verified?: boolean;
  bgColor?: string;
  initials?: string;
  role?: string;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EditUserModalUser | null;
  onSaved: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaved,
}) => {
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubVerified, setGithubVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const originalGithub = useRef("");

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  // Fetch roles whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    userService.listRoles().then(setRoles).catch(() => {});
  }, [isOpen]);

  // Populate form fields when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setRoleId(user.role_id || "");
      const gh = user.github_username || "";
      setGithubUsername(gh);
      originalGithub.current = gh;
      setGithubVerified(!!user.github_verified);
    }
    setShowBlockConfirm(false);
  }, [user]);

  if (!isOpen || !mounted || !user) return null;

  const githubChanged = githubUsername !== originalGithub.current;
  const githubRequiresVerification = user.requires_github_access && githubChanged;
  const saveEnabled = !githubRequiresVerification || githubVerified;

  const handleGithubChange = (val: string) => {
    setGithubUsername(val);
    if (val !== originalGithub.current) {
      setGithubVerified(false);
    } else {
      setGithubVerified(!!user.github_verified);
    }
  };

  const handleVerify = async () => {
    if (!githubUsername.trim()) {
      toast("Please enter a GitHub username.", "error");
      return;
    }
    setIsVerifying(true);
    try {
      await githubService.validateUser(githubUsername.trim());
      setGithubVerified(true);
      toast("GitHub ID verified successfully!");
    } catch (err: any) {
      setGithubVerified(false);
      const msg = err.response?.data?.error || err.message || "GitHub verification failed";
      toast(msg, "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast("Name is required.", "error");
      return;
    }
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = { name: name.trim() };
      if (roleId && roleId !== user.role_id) {
        payload.role_id = roleId;
      }
      if (user.requires_github_access && githubChanged) {
        payload.github_username = githubUsername.trim();
      }
      await userService.patch(user.id, payload);
      toast("User updated successfully!");
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to update user";
      toast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockConfirmed = async () => {
    setShowBlockConfirm(false);
    setIsBlocking(true);
    try {
      await userService.patch(user.id, { is_active: false });
      toast(`${user.name} has been blocked.`);
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to block user";
      toast(msg, "error");
    } finally {
      setIsBlocking(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh] relative"
      >
        {/* ── Block confirm overlay ── */}
        <AnimatePresence>
          {showBlockConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-[2px] rounded-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="bg-white border border-black/8 rounded-xl shadow-2xl p-6 mx-6 flex flex-col items-center gap-4 text-center max-w-xs w-full"
              >
                <div className="h-12 w-12 rounded-full bg-[#fff0f0] flex items-center justify-center">
                  <UserLock size={22} className="text-[#c62828]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a] mb-1">Block {user.name}?</p>
                  <p className="text-[12px] text-[#8a7f75] leading-relaxed">
                    This user will immediately lose access to the platform. You can unblock them later.
                  </p>
                </div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setShowBlockConfirm(false)}
                    className="flex-1 h-9 text-xs font-semibold rounded-md border border-black/10 text-[#2b2622] hover:bg-[#faf9f8] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBlockConfirmed}
                    disabled={isBlocking}
                    className="flex-1 h-9 text-xs font-semibold rounded-md bg-[#c62828] text-white hover:bg-[#b71c1c] disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isBlocking ? <Loader2 size={12} className="animate-spin" /> : <UserLock size={12} />}
                    Block User
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-[#fdfcf9]">
          <div className="flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${user.bgColor || "bg-[#d08873]"}`}
            >
              {user.initials || user.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1a1a1a]">Edit User</h2>
              <p className="text-[11px] text-[#8a7f75]">{user.role || "Member"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a7f75] hover:text-[#1a1a1a] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8a7f75]">
              Full Name <span className="text-[#c62828] font-bold">*</span>
            </label>
            <InputField
              placeholder="eg. Sangeeth"
              value={name}
              onChange={(e) => setName(e.target.value)}
              iconLeft={<User size={14} className="text-[#8a7f75]" />}
              className="bg-[#fdfcf9] border-black/5 text-sm h-10"
            />
          </div>

          {/* Email — read-only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8a7f75] flex items-center gap-2">
              Email Address
              <span className="text-[10px] font-medium text-[#aaa] bg-[#f5f5f5] px-1.5 py-0.5 rounded-sm">
                Not editable
              </span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#bbb]">
                <Mail size={14} />
              </span>
              <input
                type="email"
                value={user.email}
                readOnly
                disabled
                className="w-full pl-9 pr-3 h-10 text-sm rounded-md border border-black/5 bg-[#f5f5f5] text-[#aaa] cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Role dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8a7f75] flex items-center gap-1.5">
              <Shield size={12} className="text-[#8a7f75]" />
              Role <span className="text-[#c62828] font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={roles.length === 0}
                className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {roles.length === 0 && (
                  <option value="">Loading roles…</option>
                )}
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* GitHub ID */}
          {user.requires_github_access && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#8a7f75]">GitHub ID</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <InputField
                    placeholder="eg. sangeethPumex"
                    value={githubUsername}
                    onChange={(e) => handleGithubChange(e.target.value)}
                    iconLeft={<GithubIcon size={14} className="text-[#8a7f75]" />}
                    className="bg-[#fdfcf9] border-black/5 text-sm h-10"
                  />
                </div>

                {githubVerified && !githubChanged ? (
                  <div className="flex items-center gap-1.5 text-[#2e7d32] text-xs font-semibold shrink-0 pr-1">
                    <span className="h-7 w-7 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                      <Check size={13} />
                    </span>
                    Verified
                  </div>
                ) : githubChanged ? (
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying || !githubUsername.trim()}
                    className="shrink-0 h-10 px-3 text-xs font-semibold rounded-md border border-black/10 bg-[#fdfcf9] text-[#2b2622] hover:bg-[#f5f0eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {isVerifying ? (
                      <><Loader2 size={12} className="animate-spin" />Verifying…</>
                    ) : (
                      <><GithubIcon size={12} />Verify GitHub ID</>
                    )}
                  </button>
                ) : null}
              </div>

              {githubChanged && !githubVerified && (
                <p className="text-[11px] text-[#d08873] font-medium mt-0.5">
                  GitHub ID changed — please verify before saving.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-black/5 bg-[#fdfcf9] flex justify-between items-center gap-3">
          <button
            type="button"
            id="block-user-btn"
            onClick={() => setShowBlockConfirm(true)}
            disabled={isBlocking || isSaving}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-md border border-[#c62828] text-[#c62828] bg-white hover:bg-[#fff5f5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isBlocking ? <Loader2 size={12} className="animate-spin" /> : <UserLock size={12} />}
            Block User
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={onClose}
              width="w-auto"
              className="cursor-pointer text-xs h-9 border border-black/5"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!saveEnabled || isSaving || !name.trim()}
              icon={isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              width="w-auto"
              className="cursor-pointer text-xs h-9"
            >
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
