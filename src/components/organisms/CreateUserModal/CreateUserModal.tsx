"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Check, User, Mail, Shield } from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/atoms/Toast/Toast";

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

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newUser: {
    name: string;
    email: string;
    role_id: string;
    role_name: string;
    github_username?: string;
    requires_github_access: boolean;
  }) => void;
}

const ROLES = [
  { id: "659736a9-4e8c-4b7d-a421-77a5f88d8200", name: "Admin" },
  { id: "759736a9-4e8c-4b7d-a421-77a5f88d8201", name: "Engineer" },
  { id: "859736a9-4e8c-4b7d-a421-77a5f88d8202", name: "DevOps" },
  { id: "959736a9-4e8c-4b7d-a421-77a5f88d8203", name: "Viewer" },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(ROLES[0].id);
  const [requiresGithubAccess, setRequiresGithubAccess] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!name || !email) {
        toast("Please fill in all required fields.", "error");
        return;
      }
      if (requiresGithubAccess && !githubUsername) {
        toast("Please enter your GitHub username.", "error");
        return;
      }
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    const selectedRole = ROLES.find((r) => r.id === roleId);
    
    onCreate({
      name,
      email,
      role_id: roleId,
      role_name: selectedRole ? selectedRole.name : "Viewer",
      github_username: requiresGithubAccess ? githubUsername : undefined,
      requires_github_access: requiresGithubAccess,
    });

    toast("Email has been sent to user");
    
    // Reset form
    setName("");
    setEmail("");
    setRoleId(ROLES[0].id);
    setRequiresGithubAccess(false);
    setGithubUsername("");
    setStep(1);
    onClose();
  };

  const selectedRoleName = ROLES.find((r) => r.id === roleId)?.name || "";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:h-[480px]"
      >
        {/* Left Sidebar Steps Navigator */}
        <div className="w-full md:w-52 bg-[#fdfcf9] border-r border-black/5 p-5 flex flex-col gap-6 select-none">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#d08873]" />
            <span className="text-[10px] font-semibold text-[#1a1a1a] uppercase tracking-wider">Create User</span>
          </div>

          <div className="flex flex-col gap-5">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 1
                    ? "bg-[#d08873] text-white"
                    : step > 1
                    ? "bg-[#2e7d32] text-white"
                    : "bg-white border border-black/10 text-[#8a7f75]"
                }`}
              >
                {step > 1 ? <Check size={12} /> : "1"}
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${step === 1 ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}>
                  Step 1
                </span>
                <span className="text-[9px] text-[#8a7f75] leading-none mt-0.5 font-medium">User Details</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 2
                    ? "bg-[#d08873] text-white"
                    : "bg-white border border-black/10 text-[#8a7f75]"
                }`}
              >
                "2"
              </div>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${step === 2 ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}>
                  Step 2
                </span>
                <span className="text-[9px] text-[#8a7f75] leading-none mt-0.5 font-medium">Confirm & Send</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center select-none">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Create New User</h2>
            <button
              onClick={onClose}
              className="text-[#8a7f75] hover:text-[#1a1a1a] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal Step Content (scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4 h-full justify-between"
                >
                  <div className="flex flex-col gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1">
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

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">
                        Email Address <span className="text-[#c62828] font-bold">*</span>
                      </label>
                      <InputField
                        type="email"
                        placeholder="eg. sangeeth@pumexinfotech.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        iconLeft={<Mail size={14} className="text-[#8a7f75]" />}
                        className="bg-[#fdfcf9] border-black/5 text-sm h-10"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mt-1">
                      {/* Role selection */}
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#8a7f75]">
                          Role <span className="text-[#c62828] font-bold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-10"
                          >
                            {ROLES.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
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

                      {/* GitHub user toggle */}
                      <div className="flex flex-col justify-end h-full pt-4">
                        <div className="flex items-center justify-between p-2.5 rounded-md border border-black/5 bg-[#fdfcf9] h-10">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-[#1a1a1a]">Is GitHub User?</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setRequiresGithubAccess(!requiresGithubAccess)}
                            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              requiresGithubAccess ? "bg-[#d08873]" : "bg-black/10"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                requiresGithubAccess ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* GitHub Username (conditional) */}
                    <AnimatePresence>
                      {requiresGithubAccess && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="flex flex-col gap-1 overflow-hidden"
                        >
                          <label className="text-xs font-semibold text-[#8a7f75] mt-1">
                            GitHub Username <span className="text-[#c62828] font-bold">*</span>
                          </label>
                          <InputField
                            placeholder="eg. sangeethPumex"
                            value={githubUsername}
                            onChange={(e) => setGithubUsername(e.target.value)}
                            iconLeft={<GithubIcon size={14} className="text-[#8a7f75]" />}
                            className="bg-[#fdfcf9] border-black/5 text-sm h-10"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4 h-full justify-between"
                >
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-[#8a7f75] uppercase tracking-wider pb-1 border-b border-black/5">
                      Confirm User Details
                    </h3>
                    
                    <div className="border border-black/5 bg-[#fdfcf9] rounded-md p-4 flex flex-col gap-4 text-xs text-[#6b5e52] leading-relaxed">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Full Name</span>
                          <span className="text-sm font-medium text-[#2b2622]">{name}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Email Address</span>
                          <span className="text-sm font-medium text-[#2b2622]">{email}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-3">
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Role</span>
                          <span className="inline-block bg-[#faf1ee] text-[#d08873] text-[10px] font-semibold px-2 py-0.5 rounded-sm mt-0.5">
                            {selectedRoleName}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">GitHub Access Required</span>
                          <span className="text-sm font-medium text-[#2b2622]">
                            {requiresGithubAccess ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      {requiresGithubAccess && (
                        <div className="border-t border-black/5 pt-3">
                          <span className="font-semibold block text-[#1a1a1a]">GitHub Username</span>
                          <span className="text-sm font-medium text-[#2b2622] flex items-center gap-1.5 mt-0.5">
                            <GithubIcon size={12} className="text-[#8a7f75]" />
                            {githubUsername}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal Footer Buttons */}
          <div className="px-6 py-4 border-t border-black/5 bg-[#fdfcf9] flex justify-between items-center select-none">
            {step > 1 ? (
              <Button
                variant="secondary"
                onClick={handleBack}
                icon={<ChevronLeft size={14} />}
                width="w-auto"
                className="cursor-pointer text-xs h-9 border border-black/5"
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!name || !email || (requiresGithubAccess && !githubUsername)}
                icon={<ChevronRight size={14} />}
                iconPosition="right"
                width="w-auto"
                className="cursor-pointer text-xs h-9"
              >
                Next: Confirm Details
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={<Check size={14} />}
                width="w-auto"
                className="cursor-pointer text-xs h-9"
              >
                Confirm & Create
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
