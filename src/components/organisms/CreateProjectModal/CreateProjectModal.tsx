"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Check} from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/components/molecules/ProjectCard/ProjectCard";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProject: Project) => void;
}

interface MemberOption {
  name: string;
  handle: string;
  avatarColor: string;
}

const RECOMMENDED_MEMBERS: MemberOption[] = [
  { name: "Luna Valen", handle: "@lunaVortex", avatarColor: "bg-[#d08873]" },
  { name: "Ravi Aven", handle: "@raviQuantum", avatarColor: "bg-[#8e7a6f]" },
  { name: "Isla Jansen", handle: "@islaNova", avatarColor: "bg-[#a89587]" },
  { name: "Kiran Dey", handle: "@kiranChronos", avatarColor: "bg-[#beab9d]" },
  { name: "Mira Elwood", handle: "@miraCelestia", avatarColor: "bg-[#cfbeab]" },
  { name: "Tariq Bloom", handle: "@tariqElemental", avatarColor: "bg-[#dfd0be]" },
];

const CONNECTED_RESOURCES = [
  { type: "EC2", label: "amcaws::3tus-west-2:456.......", color: "text-[#1565c0] bg-[#e3f2fd]" },
  { type: "RDS", label: "@liamCloud", color: "text-[#2e7d32] bg-[#e8f5e9]" },
  { type: "S3", label: "@noraSky", color: "text-[#e65100] bg-[#fff3e0]" },
  { type: "ECR", label: "@ethanNebula", color: "text-[#c62828] bg-[#ffebee]" },
  { type: "EC2", label: "@zaraStellar", color: "text-[#1565c0] bg-[#e3f2fd]" },
  { type: "EC2", label: "@owenCosmic", color: "text-[#1565c0] bg-[#e3f2fd]" },
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [projectName, setProjectName] = useState("");
  const [team, setTeam] = useState("Platform Engineering");
  const [projectType, setProjectType] = useState("Internal Project");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [members, setMembers] = useState("");

  const [org, setOrg] = useState("Core Harbor");
  const [repo, setRepo] = useState("harbor-frontend-repo");
  const [branch, setBranch] = useState("dev");
  const [runtime, setRuntime] = useState("harbor-frontend-repo");
  const [envName, setEnvName] = useState("dev");
  
  const [awsRegion, setAwsRegion] = useState("");
  const [awsService, setAwsService] = useState("");
  const [awsResource, setAwsResource] = useState("i-08fdf90290c60e790");

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  const toggleMember = (name: string) => {
    if (selectedMembers.includes(name)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== name));
      setMembers(selectedMembers.filter((m) => m !== name).join(", "));
    } else {
      const updated = [...selectedMembers, name];
      setSelectedMembers(updated);
      setMembers(updated.join(", "));
    }
  };

  const handleNext = () => {
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    // Generate new project based on form values
    const newProj: Project = {
      id: projectName.toLowerCase().replace(/\s+/g, "-") || "new-project",
      name: projectName || "New Project",
      description: description || "No description provided.",
      repo: `org/${repo}`,
      branch: branch || "main",
      healthyCount: 1,
      unhealthyCount: 0,
      lastDeployment: "Just now",
      lastDeployedBy: "You",
      status: "healthy",
    };

    onCreate(newProj);
    // Reset Form
    setProjectName("");
    setDescription("");
    setTags("");
    setMembers("");
    setSelectedMembers([]);
    setStep(1);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:h-[620px]"
      >
        {/* Left Sidebar Steps Navigator */}
        <div className="w-full md:w-56 bg-[#fdfcf9] border-r border-black/5 p-5 flex flex-col gap-6 select-none">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#d08873]" />
            <span className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">Wizard Steps</span>
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
                <span className="text-[10px] text-[#8a7f75] leading-none mt-0.5">Project Identity</span>
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
                <span className={`text-xs font-semibold ${step === 2 ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}>
                  Step 2
                </span>
                <span className="text-[10px] text-[#8a7f75] leading-none mt-0.5">Source & Config</span>
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
                <span className={`text-xs font-semibold ${step === 3 ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}>
                  Step 3
                </span>
                <span className="text-[10px] text-[#8a7f75] leading-none mt-0.5">Review & Create</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content View */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center select-none">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Create Project</h2>
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
                  className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full"
                >
                  {/* Fields form */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-[#1a1a1a] pb-1 border-b border-black/5">Project Identity</h3>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">
                        Project Name <span className="text-[#c62828] font-bold">*</span>
                      </label>
                      <InputField
                        placeholder="eg. harbor-api, frontend-api"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="bg-[#fdfcf9] border-black/5 text-sm"
                      />
                      <span className="text-[10px] text-[#8a7f75] mt-0.5">
                        Lowercase letters, numbers and hyphens only.
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#8a7f75]">
                          Team / Owner <span className="text-[#c62828] font-bold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                          >
                            <option value="Platform Engineering">Platform Engineering</option>
                            <option value="Product Delivery">Product Delivery</option>
                            <option value="Core Architecture">Core Architecture</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#8a7f75]">
                          Project Type <span className="text-[#c62828] font-bold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={projectType}
                            onChange={(e) => setProjectType(e.target.value)}
                            className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                          >
                            <option value="Internal Project">Internal Project</option>
                            <option value="Client Project">Client Project</option>
                            <option value="Open Source">Open Source</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">
                        Description <span className="text-[#c62828] font-bold">*</span>
                      </label>
                      <textarea
                        placeholder="Brief description of what this project does"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] p-2.5 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">Tags</label>
                      <InputField
                        placeholder="eg. backend, go, etc"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="bg-[#fdfcf9] border-black/5 text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">Members</label>
                      <InputField
                        placeholder="eg. sangeeth"
                        value={members}
                        onChange={(e) => setMembers(e.target.value)}
                        className="bg-[#fdfcf9] border-black/5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Sidebar member selection */}
                  <div className="lg:col-span-4 border-l border-black/5 pl-4 flex flex-col gap-3">
                    <h4 className="text-xs font-semibold text-[#1a1a1a]">Suggested Members</h4>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
                      {RECOMMENDED_MEMBERS.map((m, idx) => {
                        const isSelected = selectedMembers.includes(m.name);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleMember(m.name)}
                            className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "border-[#d08873] bg-[#fdfcf9]"
                                : "border-black/5 hover:bg-[#faf9f8]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${m.avatarColor}`}>
                                {m.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-[#1a1a1a]">{m.name}</span>
                                <span className="text-[10px] text-[#8a7f75] leading-none mt-0.5">{m.handle}</span>
                              </div>
                            </div>
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                              isSelected ? "bg-[#d08873] border-[#d08873] text-white" : "border-black/15 bg-white"
                            }`}>
                              {isSelected && <Check size={10} />}
                            </div>
                          </div>
                        );
                      })}
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
                  className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full"
                >
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-[#1a1a1a] pb-1 border-b border-black/5">Source & Config</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#8a7f75]">
                          Organization/Project <span className="text-[#c62828] font-bold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={org}
                            onChange={(e) => setOrg(e.target.value)}
                            className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                          >
                            <option value="Core Harbor">Core Harbor</option>
                            <option value="Sub-Domain B">Sub-Domain B</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#8a7f75]">
                          GitHub Repo <span className="text-[#c62828] font-bold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={repo}
                            onChange={(e) => setRepo(e.target.value)}
                            className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                          >
                            <option value="harbor-frontend-repo">harbor-frontend-repo</option>
                            <option value="harbor-api-repo">harbor-api-repo</option>
                            <option value="auth-service-repo">auth-service-repo</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#8a7f75]">
                          Branch <span className="text-[#c62828] font-bold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                          >
                            <option value="dev">dev</option>
                            <option value="main">main</option>
                            <option value="staging">staging</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#8a7f75]">
                          Runtime <span className="text-[#c62828] font-bold">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={runtime}
                            onChange={(e) => setRuntime(e.target.value)}
                            className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                          >
                            <option value="harbor-frontend-repo">harbor-frontend-repo</option>
                            <option value="Go 1.22">Go 1.22</option>
                            <option value="Node 20">Node 20</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">Environment Name</label>
                      <div className="relative">
                        <select
                          value={envName}
                          onChange={(e) => setEnvName(e.target.value)}
                          className="w-full appearance-none bg-[#fdfcf9] border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                        >
                          <option value="dev">dev</option>
                          <option value="uat">uat</option>
                          <option value="production">production</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* AWS Deployment Target Block */}
                    <div className="border border-black/5 bg-[#fdfcf9] rounded-md p-4 mt-2">
                      <h4 className="text-xs font-semibold text-[#1a1a1a] mb-3">AWS Deployment Target</h4>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#8a7f75]">
                            AWS Region <span className="text-[#c62828] font-bold">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={awsRegion}
                              onChange={(e) => setAwsRegion(e.target.value)}
                              className="w-full appearance-none bg-white border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                            >
                              <option value="">Select Region</option>
                              <option value="us-east-1">us-east-1 (N. Virginia)</option>
                              <option value="us-west-2">us-west-2 (Oregon)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#8a7f75]">
                            Service <span className="text-[#c62828] font-bold">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={awsService}
                              onChange={(e) => setAwsService(e.target.value)}
                              className="w-full appearance-none bg-white border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                            >
                              <option value="">Select Service</option>
                              <option value="EC2">EC2 Instance</option>
                              <option value="ECS">ECS Container</option>
                              <option value="S3">S3 Static</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 mb-2">
                        <label className="text-xs font-semibold text-[#8a7f75]">Resource</label>
                        <div className="relative">
                          <select
                            value={awsResource}
                            onChange={(e) => setAwsResource(e.target.value)}
                            className="w-full appearance-none bg-white border border-black/5 text-sm text-[#2b2622] py-2 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200 cursor-pointer h-[38px]"
                          >
                            <option value="i-08fdf90290c60e790">i-08fdf90290c60e790</option>
                            <option value="i-0abc1234567890def">i-0abc1234567890def</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-[#8a7f75]">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="text-xs text-[#d08873] hover:text-[#be7560] font-semibold flex items-center gap-1.5 mt-3 select-none cursor-pointer"
                      >
                        + New Service
                      </button>
                    </div>
                  </div>

                  {/* Connected resources sidebar */}
                  <div className="lg:col-span-4 border-l border-black/5 pl-4 flex flex-col gap-3">
                    <h4 className="text-xs font-semibold text-[#1a1a1a]">Connected Resources</h4>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
                      {CONNECTED_RESOURCES.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-md border border-black/5 bg-[#fdfcf9]"
                        >
                          <div className={`h-7 w-7 rounded-sm flex items-center justify-center font-bold text-[10px] ${r.color}`}>
                            {r.type}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#1a1a1a] truncate">{r.type}</span>
                            <span className="text-[10px] text-[#8a7f75] truncate leading-none mt-0.5">{r.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
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
                  className="flex flex-col h-full gap-4"
                >
                  <h3 className="text-sm font-semibold text-[#1a1a1a] pb-1 border-b border-black/5">Review & Create</h3>

                  <div className="border border-black/5 bg-[#fdfcf9] rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                    {/* Identity Summary */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-[#8a7f75] uppercase tracking-wider">Project Identity</h4>
                      <div className="flex flex-col gap-2.5 text-xs text-[#6b5e52]">
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Project Name</span>
                          <span>{projectName || "harbor-api"}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Team / Owner</span>
                          <span>{team}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Project Type</span>
                          <span>{projectType}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Tags</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(tags || "Go, backend, api").split(",").map((t, idx) => (
                              <span key={idx} className="bg-white border border-black/5 text-[10px] text-[#8a7f75] px-1.5 py-0.5 rounded-sm">
                                {t.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Source & Compute Summary */}
                    <div className="flex flex-col gap-3 border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-6">
                      <h4 className="text-xs font-bold text-[#8a7f75] uppercase tracking-wider">Source & Compute</h4>
                      <div className="flex flex-col gap-2.5 text-xs text-[#6b5e52]">
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Repository</span>
                          <span>org/{repo}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Branch</span>
                          <span className="text-[#1565c0] font-medium">{branch}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Runtime</span>
                          <span>{runtime === "harbor-frontend-repo" ? "Go 1.22" : runtime}</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Services Target</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {["EC2", "ECR", "RDS", "S3"].map((s, idx) => (
                              <span key={idx} className="bg-[#fff3e0] text-[#e65100] border border-[#e65100]/10 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Region</span>
                          <span>{awsRegion || "us-east-1"}</span>
                        </div>
                      </div>
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

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={step === 1 && !projectName}
                icon={<ChevronRight size={14} />}
                iconPosition="right"
                width="w-auto"
                className="cursor-pointer text-xs h-9"
              >
                Next: {step === 1 ? "Source & Config" : "Review and Create"}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                icon={<Check size={14} />}
                width="w-auto"
                className="cursor-pointer text-xs h-9"
              >
                Create Project
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
