"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X, ChevronRight, ChevronLeft, Check, Plus, Trash2, Loader2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/components/molecules/ProjectCard/ProjectCard";
import { teamService } from "@/services/team_service";
import { userService } from "@/services/user_service";
import { githubService } from "@/services/github_service";
import { awsService } from "@/services/aws_service";
import { projectService } from "@/services/project_service";
import { toast } from "sonner";

/* ─── Types ─── */
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProject: Project) => void;
}
interface TeamOption { id: string; teamName: string; }
interface UserOption { id: string; name: string; email: string; }
interface OrgOption { id: number | string; login: string; description?: string; }
interface RepoOption { name: string; default_branch?: string; }
interface BranchOption { name: string; }
interface ResourceEntry { aws_region: string; aws_service: string; aws_resource: string; }

/* ─── Constants ─── */
const AWS_REGIONS = [
  { value: "us-east-1", label: "us-east-1 (N. Virginia)" },
  { value: "us-west-2", label: "us-west-2 (Oregon)" },
  { value: "ap-south-1", label: "ap-south-1 (Mumbai)" },
  { value: "eu-west-1", label: "eu-west-1 (Ireland)" },
];
const AVAILABLE_SERVICES = ["EC2", "S3", "ELB", "ECS", "CloudWatch", "RDS"];
const PROJECT_TYPES = ["Internal Project", "Client Project", "Open Source"];
const RUNTIMES = ["Go 1.22", "Node 20", "Python 3.12", "Java 21", "Ruby 3.3"];
const BG_COLORS = [
  "bg-[#d08873]", "bg-[#8e7a6f]", "bg-[#a89587]", "bg-[#beab9d]",
  "bg-[#cfbeab]", "bg-[#1976d2]", "bg-[#7b1fa2]", "bg-[#2e7d32]",
];

/* ─── Custom Dropdown ─── */
interface DropdownOption { value: string; label: string; }
interface CustomDropdownProps {
  label?: string;
  required?: boolean;
  options: DropdownOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label, required, options, value, onChange, placeholder = "Select...", loading, disabled,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      {label && (
        <label className="text-xs font-semibold text-[#8a7f75]">
          {label} {required && <span className="text-[#c62828] font-bold">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !loading && !disabled && setOpen((o) => !o)}
          className={`w-full flex items-center justify-between h-[38px] px-3 rounded-md border text-sm text-left transition-all duration-200
            ${open ? "border-[#d08873]/60 bg-white shadow-[0_0_0_3px_rgba(208,136,115,0.08)]" : "border-black/8 bg-[#fdfcf9]"}
            ${disabled || loading ? "opacity-60 cursor-not-allowed" : "hover:border-[#d08873]/40 cursor-pointer"}
          `}
        >
          <span className={selected ? "text-[#2b2622]" : "text-[#9b8f84]"}>
            {selected ? selected.label : placeholder}
          </span>
          <span className="text-[#8a7f75] ml-2 shrink-0">
            {loading ? <Loader2 size={13} className="animate-spin" /> : <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />}
          </span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
              transition={{ duration: 0.1 }}
              style={{ transformOrigin: "top" }}
              className="absolute z-50 mt-1 w-full bg-white border border-black/8 rounded-md shadow-lg overflow-hidden"
            >
              <div className="max-h-[200px] overflow-y-auto py-1">
                {options.length === 0 ? (
                  <div className="px-3 py-2.5 text-xs text-[#8a7f75] italic">No options available</div>
                ) : (
                  options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { onChange(opt.value); setOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors cursor-pointer
                        ${value === opt.value ? "bg-[#fdf5f2] text-[#d08873] font-semibold" : "text-[#2b2622] hover:bg-[#fdfcf9]"}
                      `}
                    >
                      {opt.label}
                      {value === opt.value && <Check size={12} className="text-[#d08873]" />}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─── Main Modal ─── */
export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* API data */
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [repos, setRepos] = useState<RepoOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  /* Step 1 state */
  const [projectName, setProjectName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [projectType, setProjectType] = useState("Internal Project");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  /* Step 2 state */
  const [githubOrg, setGithubOrg] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [branch, setBranch] = useState("");
  const [runtime, setRuntime] = useState("Go 1.22");
  const [envName, setEnvName] = useState("dev");
  const [resources, setResources] = useState<ResourceEntry[]>([
    { aws_region: "us-east-1", aws_service: "", aws_resource: "" },
  ]);
  const [awsResourceOptions, setAwsResourceOptions] = useState<Record<number, string[]>>({});
  const [loadingResources, setLoadingResources] = useState<Record<number, boolean>>({});

  const [ecsTasks, setEcsTasks] = useState<Record<number, any[]>>({});
  const [loadingEcsTasks, setLoadingEcsTasks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  /* Fetch teams + users + orgs on open */
  useEffect(() => {
    if (!isOpen) return;

    setLoadingTeams(true);
    teamService.list()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.teams || []);
        setTeams(list);
        if (list.length > 0) setTeamId(list[0].id);
      })
      .catch(() => toast.error("Failed to load teams"))
      .finally(() => setLoadingTeams(false));

    setLoadingUsers(true);
    userService.list()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.users || []);
        setUsers(list);
      })
      .catch(() => {})
      .finally(() => setLoadingUsers(false));

    setLoadingOrgs(true);
    githubService.getOrgs()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOrgs(list);
        if (list.length > 0) setGithubOrg(list[0].login);
      })
      .catch(() => toast.error("Failed to load organizations"))
      .finally(() => setLoadingOrgs(false));
  }, [isOpen]);

  /* Fetch repos when org changes */
  useEffect(() => {
    if (!githubOrg) return;
    setLoadingRepos(true);
    setRepos([]);
    setGithubRepo("");
    githubService.getRepos(githubOrg)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setRepos(list);
        if (list.length > 0) setGithubRepo(list[0].name);
      })
      .catch(() => toast.error("Failed to load repositories"))
      .finally(() => setLoadingRepos(false));
  }, [githubOrg]);

  /* Fetch branches when repo changes */
  useEffect(() => {
    if (!githubOrg || !githubRepo) return;
    setLoadingBranches(true);
    setBranches([]);
    setBranch("");
    githubService.getBranches(githubOrg, githubRepo)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBranches(list);
        const defaultBranch = repos.find((r) => r.name === githubRepo)?.default_branch;
        const pick = list.find((b: BranchOption) => b.name === defaultBranch) || list[0];
        if (pick) setBranch(pick.name);
      })
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoadingBranches(false));
  }, [githubOrg, githubRepo]); // eslint-disable-line react-hooks/exhaustive-deps

  /* AWS resource fetch */
  const fetchAWSResources = async (idx: number, service: string) => {
    if (!service) return;
    setLoadingResources((p) => ({ ...p, [idx]: true }));
    setAwsResourceOptions((p) => ({ ...p, [idx]: [] }));
    setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_resource: "" } : r));
    try {
      const data = await awsService.getResources([service]);
      // Flatten response — data.data[service] or data[service]
      const raw = data?.data?.[service] ?? data?.[service] ?? data?.data ?? [];
      const names: string[] = Array.isArray(raw)
        ? raw.map((r: unknown) => {
            if (typeof r === "string") return r;
            if (typeof r === "object" && r !== null) {
              const obj = r as Record<string, unknown>;
              return String(obj.InstanceId ?? obj.Name ?? obj.BucketName ?? obj.id ?? obj.name ?? JSON.stringify(obj));
            }
            return String(r);
          })
        : [];
      setAwsResourceOptions((p) => ({ ...p, [idx]: names }));
      if (names.length > 0) setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_resource: names[0] } : r));
    } catch {
      toast.error(`Failed to load ${service} resources`);
    } finally {
      setLoadingResources((p) => ({ ...p, [idx]: false }));
    }
  };

  const handleServiceChange = (idx: number, service: string) => {
    setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_service: service, aws_resource: "" } : r));
    if (service) fetchAWSResources(idx, service);
  };

  const handleRegionChange = (idx: number, region: string) => {
    setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_region: region } : r));
  };

  const handleResourceChange = async (idx: number, resource: string) => {
    setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_resource: resource } : r));
    
    // Fetch ECS tasks if service is ECS
    if (resources[idx]?.aws_service === "ECS" && resource) {
      setLoadingEcsTasks((p) => ({ ...p, [idx]: true }));
      try {
        const data = await awsService.getECSTasks(resource);
        setEcsTasks((p) => ({ ...p, [idx]: data.data || data }));
      } catch {
        toast.error("Failed to load ECS tasks");
      } finally {
        setLoadingEcsTasks((p) => ({ ...p, [idx]: false }));
      }
    }
  };

  const addResource = () =>
    setResources((p) => [...p, { aws_region: "us-east-1", aws_service: "", aws_resource: "" }]);

  const removeResource = (idx: number) => {
    setResources((p) => p.filter((_, i) => i !== idx));
    setAwsResourceOptions((p) => { const n = { ...p }; delete n[idx]; return n; });
  };

  const toggleMember = (id: string) =>
    setSelectedMemberIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const resetForm = () => {
    setStep(1); setProjectName(""); setTeamId(teams[0]?.id || "");
    setProjectType("Internal Project"); setDescription(""); setTagsInput("");
    setSelectedMemberIds([]); setGithubOrg(orgs[0]?.login || ""); setGithubRepo(""); setBranch("");
    setRuntime("Go 1.22"); setEnvName("dev");
    setResources([{ aws_region: "us-east-1", aws_service: "", aws_resource: "" }]);
    setAwsResourceOptions({}); setLoadingResources({});
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        project_name: projectName,
        project_description: description,
        team: teamId,
        project_type: projectType,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        members: selectedMemberIds,
        github_org: githubOrg,
        github_repo: githubRepo,
        branch,
        runtime,
        environments: [{
          environment_name: envName,
          branch_name: branch,
          resources: resources.filter((r) => r.aws_service && r.aws_resource),
        }],
      };
      await projectService.create(payload);
      toast.success("Project created successfully!");
      onCreate({
        id: projectName.toLowerCase().replace(/\s+/g, "-"),
        name: projectName, description,
        repo: `${githubOrg}/${githubRepo}`, branch,
        healthyCount: 1, unhealthyCount: 0,
        lastDeployment: "Just now", lastDeployedBy: "You", status: "healthy",
      });
      resetForm(); onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      toast.error(e.response?.data?.error || e.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const teamName = teams.find((t) => t.id === teamId)?.teamName || teamId;
  const step1Valid = !!projectName && !!teamId && !!description;

  /* Build dropdown options */
  const teamOptions = teams.map((t) => ({ value: t.id, label: t.teamName }));
  const typeOptions = PROJECT_TYPES.map((p) => ({ value: p, label: p }));
  const orgOptions = orgs.map((o) => ({ value: o.login, label: o.description ? `${o.login} (${o.description})` : o.login }));
  const repoOptions = repos.map((r) => ({ value: r.name, label: r.name }));
  const branchOptions = branches.map((b) => ({ value: b.name, label: b.name }));
  const runtimeOptions = RUNTIMES.map((r) => ({ value: r, label: r }));
  const regionOptions = AWS_REGIONS.map((r) => ({ value: r.value, label: r.label }));
  const serviceOptions = AVAILABLE_SERVICES.map((s) => ({ value: s, label: s }));

  const serviceColors: Record<string, string> = {
    EC2: "text-[#1565c0] bg-[#e3f2fd]",
    S3: "text-[#e65100] bg-[#fff3e0]",
    ELB: "text-[#2e7d32] bg-[#e8f5e9]",
    ECS: "text-[#d84315] bg-[#fbe9e7]",
    CloudWatch: "text-[#00838f] bg-[#e0f7fa]",
    RDS: "text-[#6a1b9a] bg-[#f3e5f5]",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] md:h-[660px]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-56 bg-[#fdfcf9] border-r border-black/5 p-5 flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-black/5 mb-2">
            <span className="h-2 w-2 rounded-full bg-[#d08873]" />
            <span className="text-xs font-semibold text-[#1a1a1a] uppercase tracking-wider">Wizard Steps</span>
          </div>
          <div className="flex flex-col gap-5">
            {[
              { n: 1, label: "Step 1", sub: "Project Identity" },
              { n: 2, label: "Step 2", sub: "Source & Config" },
              { n: 3, label: "Step 3", sub: "Review & Create" },
            ].map(({ n, label, sub }) => (
              <div key={n} className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold
                  ${step === n ? "bg-[#d08873] text-white" : step > n ? "bg-[#2e7d32] text-white" : "bg-white border border-black/10 text-[#8a7f75]"}`}>
                  {step > n ? <Check size={12} /> : n}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-semibold ${step === n ? "text-[#1a1a1a]" : "text-[#8a7f75]"}`}>{label}</span>
                  <span className="text-[10px] text-[#8a7f75] leading-none mt-0.5">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Create Project</h2>
            <button onClick={handleClose} className="text-[#8a7f75] hover:text-[#1a1a1a] transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
            <AnimatePresence mode="wait">

              {/* ── Step 1 ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full"
                >
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-[#1a1a1a] pb-1 border-b border-black/5">Project Identity</h3>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">Project Name <span className="text-[#c62828] font-bold">*</span></label>
                      <InputField
                        placeholder="eg. harbor-api, frontend-service"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="bg-[#fdfcf9] border-black/5 text-sm"
                      />
                      <span className="text-[10px] text-[#8a7f75] mt-0.5">Lowercase letters, numbers and hyphens only.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <CustomDropdown
                        label="Team / Owner" required
                        options={teamOptions} value={teamId}
                        onChange={setTeamId} placeholder="Select Team"
                        loading={loadingTeams}
                      />
                      <CustomDropdown
                        label="Project Type" required
                        options={typeOptions} value={projectType}
                        onChange={setProjectType}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">Description <span className="text-[#c62828] font-bold">*</span></label>
                      <textarea
                        placeholder="Brief description of what this project does"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-[#fdfcf9] border border-black/8 text-sm text-[#2b2622] p-2.5 rounded-md focus:outline-none focus:border-[#d08873]/50 transition-colors duration-200"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-[#8a7f75]">Tags</label>
                      <InputField
                        placeholder="eg. backend, go, api (comma separated)"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="bg-[#fdfcf9] border-black/5 text-sm"
                      />
                    </div>
                  </div>

                  {/* Members sidebar */}
                  <div className="lg:col-span-4 border-l border-black/5 pl-4 flex flex-col gap-3">
                    <h4 className="text-xs font-semibold text-[#1a1a1a]">Suggested Members</h4>
                    {loadingUsers ? (
                      <div className="flex flex-col gap-2 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-black/5">
                            <div className="h-7 w-7 rounded-full bg-[#e8e0d8]" />
                            <div className="flex flex-col gap-1.5 flex-1">
                              <div className="h-2.5 bg-[#e8e0d8] rounded w-3/4" />
                              <div className="h-2 bg-[#e8e0d8] rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1">
                        {users.map((u, idx) => {
                          const isSelected = selectedMemberIds.includes(u.id);
                          const initials = u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                          return (
                            <div
                              key={u.id}
                              onClick={() => toggleMember(u.id)}
                              className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-all duration-200
                                ${isSelected ? "border-[#d08873] bg-[#fdf5f2]" : "border-black/5 hover:bg-[#faf9f8]"}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${BG_COLORS[idx % BG_COLORS.length]}`}>
                                  {initials}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-[#1a1a1a]">{u.name}</span>
                                  <span className="text-[10px] text-[#8a7f75] leading-none mt-0.5">{u.email}</span>
                                </div>
                              </div>
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0
                                ${isSelected ? "bg-[#d08873] border-[#d08873] text-white" : "border-black/15 bg-white"}`}>
                                {isSelected && <Check size={10} />}
                              </div>
                            </div>
                          );
                        })}
                        {users.length === 0 && <p className="text-xs text-[#8a7f75]">No users found.</p>}
                      </div>
                    )}
                    {selectedMemberIds.length > 0 && (
                      <p className="text-[10px] text-[#d08873] font-semibold">
                        {selectedMemberIds.length} member{selectedMemberIds.length > 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full"
                >
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-[#1a1a1a] pb-1 border-b border-black/5">Source & Config</h3>

                    {/* GitHub — org and repo dynamic */}
                    <div className="grid grid-cols-2 gap-4">
                      <CustomDropdown
                        label="GitHub Organization *"
                        options={orgOptions} value={githubOrg}
                        onChange={setGithubOrg} placeholder="Select Org"
                        loading={loadingOrgs}
                      />
                      <CustomDropdown
                        label="GitHub Repo *"
                        options={repoOptions} value={githubRepo}
                        onChange={setGithubRepo} placeholder="Select Repo"
                        loading={loadingRepos}
                        disabled={!githubOrg}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <CustomDropdown
                        label="Branch *"
                        options={branchOptions} value={branch}
                        onChange={setBranch} placeholder="Select Branch"
                        loading={loadingBranches}
                        disabled={!githubRepo}
                      />
                      <CustomDropdown
                        label="Runtime *"
                        options={runtimeOptions} value={runtime}
                        onChange={setRuntime}
                      />
                    </div>

                    <InputField
                      label="Environment Name"
                      required
                      placeholder="e.g. dev, staging, prod, uat"
                      value={envName}
                      onChange={(e) => setEnvName(e.target.value)}
                    />

                    {/* AWS Deployment Target */}
                    <div className="border border-black/5 bg-[#fdfcf9] rounded-md p-4">
                      <h4 className="text-xs font-semibold text-[#1a1a1a] mb-3">AWS Deployment Target</h4>
                      <div className="flex flex-col gap-3">
                        {resources.map((res, idx) => {
                          const resourceOpts = (awsResourceOptions[idx] || []).map((r) => ({ value: r, label: r }));
                          return (
                            <div key={idx} className="border border-black/5 bg-white rounded-md p-3 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-[#8a7f75] uppercase tracking-wide">Resource {idx + 1}</span>
                                {resources.length > 1 && (
                                  <button onClick={() => removeResource(idx)} className="text-[#c62828] hover:text-[#b71c1c] transition-colors cursor-pointer">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                              {/* Row 1: Region + Service */}
                              <div className="grid grid-cols-2 gap-3">
                                <CustomDropdown
                                  label="AWS Region"
                                  options={regionOptions} value={res.aws_region}
                                  onChange={(v) => handleRegionChange(idx, v)}
                                />
                                <CustomDropdown
                                  label="Service"
                                  options={serviceOptions} value={res.aws_service}
                                  onChange={(v) => handleServiceChange(idx, v)}
                                  placeholder="Select Service"
                                />
                              </div>
                              {/* Row 2: Resource identifier (only when service picked) */}
                              {res.aws_service && (
                                <CustomDropdown
                                  label={res.aws_service === "ECS" ? "Cluster" : `${res.aws_service} Resource`}
                                  options={resourceOpts} value={res.aws_resource}
                                  onChange={(v) => handleResourceChange(idx, v)}
                                  placeholder={loadingResources[idx] ? "Loading resources..." : "Select Resource"}
                                  loading={loadingResources[idx]}
                                />
                              )}
                              
                              {/* Row 3: ECS Tasks details (only when ECS cluster picked) */}
                              {res.aws_service === "ECS" && res.aws_resource && (
                                <div className="mt-1 p-3 bg-[#fdfcf9] border border-black/5 rounded-md">
                                  <h5 className="text-xs font-semibold text-[#1a1a1a] mb-2">Cluster Tasks</h5>
                                  {loadingEcsTasks[idx] ? (
                                    <div className="flex items-center gap-2 text-xs text-[#8a7f75]">
                                      <Loader2 size={12} className="animate-spin" /> Loading tasks...
                                    </div>
                                  ) : (ecsTasks[idx] || []).length > 0 ? (
                                    <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                                      {ecsTasks[idx].map((task: any, tIdx: number) => {
                                        const tName = task.taskArn.split("/").pop();
                                        return (
                                          <div key={tIdx} className="flex justify-between items-center text-[11px] p-2 bg-white border border-black/5 rounded-sm">
                                            <span className="font-medium text-[#1a1a1a] truncate w-2/3" title={task.taskArn}>{tName}</span>
                                            <div className="flex gap-2 text-[#8a7f75]">
                                              <span className="font-semibold text-[#2e7d32]">{task.lastStatus}</span>
                                              <span>{task.cpu || "?"} CPU</span>
                                              <span>{task.memory || "?"} Mem</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-[#8a7f75] italic">No active tasks in this cluster.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={addResource}
                        className="mt-3 flex items-center gap-1.5 text-xs text-[#d08873] hover:text-[#be7560] font-semibold cursor-pointer transition-colors"
                      >
                        <Plus size={12} /> Add Another Service
                      </button>
                    </div>
                  </div>

                  {/* Connected Resources preview */}
                  <div className="lg:col-span-4 border-l border-black/5 pl-4 flex flex-col gap-3">
                    <h4 className="text-xs font-semibold text-[#1a1a1a]">Added Resources</h4>
                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[420px]">
                      {resources.filter((r) => r.aws_service).length === 0 ? (
                        <p className="text-xs text-[#8a7f75] italic">No resources added yet.</p>
                      ) : (
                        resources.filter((r) => r.aws_service).map((r, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 p-2 rounded-md border border-black/5 bg-[#fdfcf9]">
                            <div className={`h-7 w-7 rounded-sm flex items-center justify-center font-bold text-[10px] shrink-0 ${serviceColors[r.aws_service] || "text-[#6b5e52] bg-[#f4f1ee]"}`}>
                              {r.aws_service}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-[#1a1a1a]">{r.aws_service}</span>
                              <span className="text-[10px] text-[#8a7f75] truncate leading-none mt-0.5">
                                {r.aws_resource || "No resource selected"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <h3 className="text-sm font-semibold text-[#1a1a1a] pb-1 border-b border-black/5">Review & Create</h3>
                  <div className="border border-black/5 bg-[#fdfcf9] rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-bold text-[#8a7f75] uppercase tracking-wider">Project Identity</h4>
                      <div className="flex flex-col gap-2.5 text-xs text-[#6b5e52]">
                        <div><span className="font-semibold block text-[#1a1a1a]">Project Name</span><span>{projectName || "—"}</span></div>
                        <div><span className="font-semibold block text-[#1a1a1a]">Team / Owner</span><span>{teamName || "—"}</span></div>
                        <div><span className="font-semibold block text-[#1a1a1a]">Project Type</span><span>{projectType}</span></div>
                        <div><span className="font-semibold block text-[#1a1a1a]">Description</span><span>{description || "—"}</span></div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Tags</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {tagsInput.split(",").map((t) => t.trim()).filter(Boolean).map((t, i) => (
                              <span key={i} className="bg-white border border-black/5 text-[10px] text-[#8a7f75] px-1.5 py-0.5 rounded-sm">{t}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">Members</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedMemberIds.length === 0
                              ? <span className="text-[#8a7f75]">None</span>
                              : users.filter((u) => selectedMemberIds.includes(u.id)).map((u) => (
                                <span key={u.id} className="bg-white border border-black/5 text-[10px] text-[#8a7f75] px-1.5 py-0.5 rounded-sm">{u.name}</span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t md:border-t-0 md:border-l border-black/5 pt-4 md:pt-0 md:pl-6">
                      <h4 className="text-xs font-bold text-[#8a7f75] uppercase tracking-wider">Source & Compute</h4>
                      <div className="flex flex-col gap-2.5 text-xs text-[#6b5e52]">
                        <div><span className="font-semibold block text-[#1a1a1a]">Repository</span><span>{githubOrg || "—"}/{githubRepo || "—"}</span></div>
                        <div><span className="font-semibold block text-[#1a1a1a]">Branch</span><span className="text-[#1565c0] font-medium">{branch || "—"}</span></div>
                        <div><span className="font-semibold block text-[#1a1a1a]">Runtime</span><span>{runtime}</span></div>
                        <div><span className="font-semibold block text-[#1a1a1a]">Environment</span><span>{envName}</span></div>
                        <div>
                          <span className="font-semibold block text-[#1a1a1a]">AWS Resources</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {resources.filter((r) => r.aws_service && r.aws_resource).map((r, i) => (
                              <span key={i} className="bg-[#fff3e0] text-[#e65100] border border-[#e65100]/10 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm">
                                {r.aws_service}: {r.aws_resource}
                              </span>
                            ))}
                            {resources.filter((r) => r.aws_service && r.aws_resource).length === 0 && (
                              <span className="text-[#8a7f75]">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-black/5 bg-[#fdfcf9] flex justify-between items-center">
            {step > 1
              ? <Button variant="secondary" onClick={() => setStep((s) => s - 1)} icon={<ChevronLeft size={14} />} width="w-auto" className="cursor-pointer text-xs h-9 border border-black/5">Back</Button>
              : <div />
            }
            {step < 3
              ? (
                <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={step === 1 && !step1Valid}
                  icon={<ChevronRight size={14} />} iconPosition="right" width="w-auto" className="cursor-pointer text-xs h-9">
                  Next: {step === 1 ? "Source & Config" : "Review and Create"}
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} isLoading={submitting}
                  icon={submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  width="w-auto" className="cursor-pointer text-xs h-9">
                  {submitting ? "Creating..." : "Create Project"}
                </Button>
              )
            }
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
