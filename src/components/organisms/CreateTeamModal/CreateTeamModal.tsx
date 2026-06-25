"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/atoms/Toast/Toast";

interface MemberOption {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
  currentTeam?: string;
}

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTeams: { id: string; name: string; members: { name: string }[] }[];
  onCreate: (newTeam: {
    name: string;
    description: string;
    teamLeadID: string;
    teamMembersIDs: string[];
  }) => void;
}

const ALL_MEMBERS: MemberOption[] = [
  {
    id: "8a71fd85-cca8-4329-a4f1-eb1c65f142a8",
    name: "Admin User",
    initials: "AU",
    role: "Lead DevOps",
    avatarColor: "bg-[#d08873]",
  },
  {
    id: "9fb56ea3-6912-4451-9644-3d5ea9e3db4d",
    name: "Ava S.",
    initials: "AS",
    role: "Cloud Engineer",
    avatarColor: "bg-[#8e7a6f]",
  },
  {
    id: "a871fd85-cca8-4329-a4f1-eb1c65f142a2",
    name: "Ravi Aven",
    initials: "RA",
    role: "Kubernetes Architect",
    avatarColor: "bg-[#a89587]",
  },
  {
    id: "b871fd85-cca8-4329-a4f1-eb1c65f142a3",
    name: "Emma R.",
    initials: "ER",
    role: "Frontend Lead",
    avatarColor: "bg-[#beab9d]",
  },
  {
    id: "c871fd85-cca8-4329-a4f1-eb1c65f142a4",
    name: "Noah P.",
    initials: "NP",
    role: "React Developer",
    avatarColor: "bg-[#cfbeab]",
  },
  {
    id: "d871fd85-cca8-4329-a4f1-eb1c65f142a5",
    name: "Luna Valen",
    initials: "LV",
    role: "UX Designer",
    avatarColor: "bg-[#dfd0be]",
  },
  {
    id: "e871fd85-cca8-4329-a4f1-eb1c65f142a6",
    name: "Priya S.",
    initials: "PS",
    role: "QA Engineer",
    avatarColor: "bg-[#d08873]",
  },
  {
    id: "f871fd85-cca8-4329-a4f1-eb1c65f142a7",
    name: "Sophia L.",
    initials: "SL",
    role: "Principal Architect",
    avatarColor: "bg-[#8e7a6f]",
  },
  {
    id: "g871fd85-cca8-4329-a4f1-eb1c65f142a8",
    name: "Chen W.",
    initials: "CW",
    role: "SecOps Specialist",
    avatarColor: "bg-[#beab9d]",
  },
  {
    id: "h871fd85-cca8-4329-a4f1-eb1c65f142a9",
    name: "Alex K.",
    initials: "AK",
    role: "Data Engineer",
    avatarColor: "bg-[#dfd0be]",
  },
];

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  existingTeams,
  onCreate,
}) => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  // Form States
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLeadID, setTeamLeadID] = useState(ALL_MEMBERS[0].id);
  const [teamMembersIDs, setTeamMembersIDs] = useState<string[]>([]);

  // Custom dialog state for member warning
  const [warningMember, setWarningMember] = useState<MemberOption | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!isOpen || !mounted) return null;

  // Find what team a member is currently on
  const getMemberCurrentTeam = (memberName: string) => {
    const foundTeam = existingTeams.find((t) =>
      t.members.some((m) => m.name.toLowerCase() === memberName.toLowerCase()),
    );
    return foundTeam ? foundTeam.name : undefined;
  };

  const handleMemberSelect = (member: MemberOption) => {
    const isSelected = teamMembersIDs.includes(member.id);

    if (isSelected) {
      // Deselect is always allowed
      setTeamMembersIDs(teamMembersIDs.filter((id) => id !== member.id));
    } else {
      // Check if already in a team
      const currentTeam = getMemberCurrentTeam(member.name);
      if (currentTeam) {
        // Trigger multi-team confirmation dialog
        setWarningMember({ ...member, currentTeam });
      } else {
        setTeamMembersIDs([...teamMembersIDs, member.id]);
      }
    }
  };

  const handleConfirmWarning = (allow: boolean) => {
    if (allow && warningMember) {
      setTeamMembersIDs([...teamMembersIDs, warningMember.id]);
      toast(`${warningMember.name} added to the team.`);
    }
    setWarningMember(null);
  };

  const handleNext = () => {
    if (step === 1 && !teamName) {
      toast("Please enter a team name.", "error");
      return;
    }
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    onCreate({
      name: teamName,
      description: teamDescription,
      teamLeadID,
      teamMembersIDs,
    });

    toast(`Team "${teamName}" created successfully!`);

    // Reset Form
    setTeamName("");
    setTeamDescription("");
    setTeamLeadID(ALL_MEMBERS[0].id);
    setTeamMembersIDs([]);
    setStep(1);
    onClose();
  };

  const selectedLead = ALL_MEMBERS.find((m) => m.id === teamLeadID);
  const selectedMembers = ALL_MEMBERS.filter((m) =>
    teamMembersIDs.includes(m.id),
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:h-[500px] relative"
      >
        {/* Left Sidebar Steps Navigator */}
        <div className="w-full md:w-52 bg-[#fdfcf9] border-r border-black/5 p-5 flex flex-col gap-6 select-none shrink-0">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#d08873]" />
            <span className="text-[10px] font-semibold text-[#1a1a1a] uppercase tracking-wider">
              Create Team
            </span>
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
                <span
                  className={`text-xs font-semibold ${step === 1 ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}
                >
                  Step 1
                </span>
                <span className="text-[9px] text-[#8a7f75] leading-none mt-0.5 font-medium">
                  Team Identity
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 2
                    ? "bg-[#d08873] text-white"
                    : step > 2
                      ? "bg-[#2e7d32] text-white"
                      : "bg-white border border-black/10 text-[#8a7f75]"
                }`}
              >
                {step > 2 ? <Check size={12} /> : "2"}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-semibold ${step === 2 ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}
                >
                  Step 2
                </span>
                <span className="text-[9px] text-[#8a7f75] leading-none mt-0.5 font-medium">
                  Select Members
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step === 3
                    ? "bg-[#d08873] text-white"
                    : "bg-white border border-black/10 text-[#8a7f75]"
                }`}
              >
                3
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-semibold ${step === 3 ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}
                >
                  Step 3
                </span>
                <span className="text-[9px] text-[#8a7f75] leading-none mt-0.5 font-medium">
                  Review & Create
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center select-none">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">
              Create New Team
            </h2>
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
                  className="flex flex-col gap-4"
                >
                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#8a7f75]">
                      Team Name{" "}
                      <span className="text-[#c62828] font-bold">*</span>
                    </label>
                    <InputField
                      placeholder="eg. Backend Core Team"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="bg-[#fdfcf9] border-black/5 text-sm h-10"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#8a7f75]">
                      Description
                    </label>
                    <textarea
                      placeholder="eg. Responsible for core user backend api's"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] p-2.5 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 resize-none"
                    />
                  </div>

                  {/* Team Lead Select */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#8a7f75]">
                      Team Lead{" "}
                      <span className="text-[#c62828] font-bold">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={teamLeadID}
                        onChange={(e) => setTeamLeadID(e.target.value)}
                        className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-10"
                      >
                        {ALL_MEMBERS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
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
                  className="flex flex-col gap-3"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-black/5">
                    <h3 className="text-xs font-bold text-[#8a7f75] uppercase tracking-wider">
                      Select Team Members
                    </h3>
                    <span className="text-[10px] text-[#8a7f75] font-semibold">
                      {teamMembersIDs.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1">
                    {ALL_MEMBERS.map((member) => {
                      const isSelected = teamMembersIDs.includes(member.id);
                      const currentTeam = getMemberCurrentTeam(member.name);

                      return (
                        <div
                          key={member.id}
                          onClick={() => handleMemberSelect(member)}
                          className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition-all duration-150 ${
                            isSelected
                              ? "border-[#d08873] bg-[#fdfcf9]"
                              : "border-black/5 hover:bg-[#faf9f8]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${member.avatarColor}`}
                            >
                              {member.initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-[#1a1a1a]">
                                {member.name}
                              </span>
                              <span className="text-[10px] text-[#8a7f75] leading-none mt-0.5">
                                {member.role}
                              </span>
                              {currentTeam && (
                                <span className="text-[8px] text-[#d08873] font-semibold mt-1">
                                  On {currentTeam}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? "bg-[#d08873] border-[#d08873] text-white"
                                : "border-black/15 bg-white"
                            }`}
                          >
                            {isSelected && <Check size={11} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-xs font-bold text-[#8a7f75] uppercase tracking-wider pb-1 border-b border-black/5">
                    Review Details & Create
                  </h3>

                  <div className="border border-black/5 bg-[#fdfcf9] rounded-md p-4 flex flex-col gap-4 text-xs text-[#6b5e52]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold block text-[#1a1a1a]">
                          Team Name
                        </span>
                        <span className="text-sm font-semibold text-[#2b2622]">
                          {teamName}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold block text-[#1a1a1a]">
                          Team Lead
                        </span>
                        <span className="text-sm font-semibold text-[#2b2622]">
                          {selectedLead?.name}
                        </span>
                      </div>
                    </div>

                    {teamDescription && (
                      <div className="border-t border-black/5 pt-3">
                        <span className="font-semibold block text-[#1a1a1a]">
                          Description
                        </span>
                        <p className="mt-0.5 leading-relaxed">
                          {teamDescription}
                        </p>
                      </div>
                    )}

                    <div className="border-t border-black/5 pt-3">
                      <span className="font-semibold block text-[#1a1a1a] mb-2">
                        Team Members ({selectedMembers.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMembers.map((m) => (
                          <span
                            key={m.id}
                            className="bg-white border border-black/5 text-[#d08873] font-semibold px-2.5 py-1 rounded-sm text-[10px] flex items-center gap-1.5 shadow-2xs"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${m.avatarColor}`}
                            />
                            {m.name}
                          </span>
                        ))}
                        {selectedMembers.length === 0 && (
                          <span className="text-[#8a7f75] italic">
                            No members selected.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Modal Footer Buttons */}
          <div className="px-6 py-4 border-t border-black/5 bg-[#fdfcf9] flex justify-between items-center select-none shrink-0">
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

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={step === 1 && !teamName}
                icon={<ChevronRight size={14} />}
                iconPosition="right"
                width="w-auto"
                className="cursor-pointer text-xs h-9"
              >
                Next: {step === 1 ? "Select Members" : "Review Details"}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={<Check size={14} />}
                width="w-auto"
                className="cursor-pointer text-xs h-9"
              >
                Create Team
              </Button>
            )}
          </div>
        </div>

        {/* Custom Confirmation Warn Dialog Overlay */}
        <AnimatePresence>
          {warningMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-3xs flex items-center justify-center p-6 z-[120]"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white rounded-md border border-black/5 p-5 shadow-lg max-w-sm w-full flex flex-col gap-4 text-center select-none"
              >
                <div className="mx-auto h-10 w-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle size={18} />
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-bold text-[#1a1a1a]">
                    Double Assignment Warning
                  </h4>
                  <p className="text-[11px] text-[#6b5e52] leading-relaxed">
                    <strong className="text-[#1a1a1a]">
                      {warningMember.name}
                    </strong>{" "}
                    is already assigned to the{" "}
                    <strong>{warningMember.currentTeam}</strong> team.
                  </p>
                  <p className="text-[10px] text-[#8a7f75] mt-1">
                    Do you want this member to belong to multiple teams?
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleConfirmWarning(false)}
                    className="flex-1 py-2 rounded-md border border-black/5 hover:bg-[#faf9f8] text-[11px] font-semibold text-[#8a7f75] transition-colors cursor-pointer"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmWarning(true)}
                    className="flex-1 py-2 rounded-md bg-[#d08873] hover:bg-[#be7560] text-[11px] font-semibold text-white transition-colors cursor-pointer"
                  >
                    Yes, Allow
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    document.body,
  );
};
