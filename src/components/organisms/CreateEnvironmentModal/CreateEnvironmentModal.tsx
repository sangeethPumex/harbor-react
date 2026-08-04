"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Check, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { motion, AnimatePresence } from "framer-motion";
import { githubService } from "@/services/github_service";
import { awsService } from "@/services/aws_service";
import { projectService } from "@/services/project_service";
import { toast } from "sonner";

interface CreateEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  githubOrg?: string;
  githubRepo: string; // Dynamic repository from parent page
  onCreated: () => void;
}

interface ResourceEntry {
  aws_region: string;
  aws_service: string;
  aws_resource: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

const AWS_REGIONS = [
  { value: "us-east-1", label: "us-east-1 (N. Virginia)" },
  { value: "us-west-2", label: "us-west-2 (Oregon)" },
  { value: "ap-south-1", label: "ap-south-1 (Mumbai)" },
  { value: "eu-west-1", label: "eu-west-1 (Ireland)" },
];
const AVAILABLE_SERVICES = ["EC2", "S3", "ELB", "ECS", "CloudWatch", "RDS"];

/* Custom Dropdown Component */
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
  label,
  required,
  options,
  value,
  onChange,
  placeholder = "Select...",
  loading,
  disabled,
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

export const CreateEnvironmentModal: React.FC<CreateEnvironmentModalProps> = ({
  isOpen,
  onClose,
  projectId,
  githubOrg,
  githubRepo,
  onCreated,
}) => {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Dropdown states */
  const [branches, setBranches] = useState<{ value: string; label: string }[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  /* Form states */
  const [envName, setEnvName] = useState("dev");
  const [branch, setBranch] = useState("");
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

  /* Fetch branches when repo changes / modal opens */
  useEffect(() => {
    if (!isOpen || !githubRepo) return;
    const owner = githubOrg || "sangeethPumex";
    setLoadingBranches(true);
    setBranches([]);
    setBranch("");
    githubService.getBranches(owner, githubRepo)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const opts = list.map((b: any) => ({ value: b.name, label: b.name }));
        setBranches(opts);
        if (opts.length > 0) setBranch(opts[0].value);
      })
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoadingBranches(false));
  }, [isOpen, githubOrg, githubRepo]);

  /* AWS resources fetching */
  const fetchAWSResources = async (idx: number, service: string) => {
    if (!service) return;
    setLoadingResources((p) => ({ ...p, [idx]: true }));
    setAwsResourceOptions((p) => ({ ...p, [idx]: [] }));
    setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_resource: "" } : r));
    try {
      const data = await awsService.getResources([service]);
      const raw = data?.data?.[service] ?? data?.[service] ?? data?.data ?? [];
      const names: string[] = Array.isArray(raw)
        ? raw.map((r: any) => {
            if (typeof r === "string") return r;
            if (typeof r === "object" && r !== null) {
              return String(r.InstanceId ?? r.Name ?? r.BucketName ?? r.id ?? r.name ?? JSON.stringify(r));
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

  const addResource = () =>
    setResources((p) => [...p, { aws_region: "us-east-1", aws_service: "", aws_resource: "" }]);

  const removeResource = (idx: number) => {
    setResources((p) => p.filter((_, i) => i !== idx));
    setAwsResourceOptions((p) => { const n = { ...p }; delete n[idx]; return n; });
  };

  const handleSave = async () => {
    if (!envName) {
      toast.error("Environment Name is required");
      return;
    }
    if (!branch) {
      toast.error("Branch is required");
      return;
    }

    setSubmitting(true);
    try {
      const mappedResources = resources
        .filter((r) => r.aws_service && r.aws_resource)
        .map((r) => ({
          aws_region: r.aws_region,
          aws_service: r.aws_service,
          aws_resource: r.aws_resource,
        }));

      await projectService.addEnvironment(projectId, {
        environment_name: envName,
        branch_name: branch,
        resources: mappedResources,
      });

      toast.success("Environment added successfully");
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Failed to add environment";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4 select-none animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-md border border-black/5 shadow-xl w-full max-w-xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-[#fdfcf9]">
          <div>
            <h2 className="text-sm font-semibold text-[#1a1a1a]">Add New Environment</h2>
            <p className="text-[11px] text-[#8a7f75]">Configure environment parameters for {githubRepo}</p>
          </div>
          <button onClick={onClose} className="text-[#8a7f75] hover:text-[#1a1a1a] transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          <InputField
            label="Environment Name"
            required
            placeholder="e.g. dev, staging, prod, uat"
            value={envName}
            onChange={(e) => setEnvName(e.target.value)}
          />

          <CustomDropdown
            label="Branch *"
            options={branches}
            value={branch}
            onChange={setBranch}
            placeholder="Select Branch"
            loading={loadingBranches}
          />

          {/* AWS Targets */}
          <div className="border border-black/5 bg-[#fdfcf9] rounded-md p-4 mt-2">
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
                    <div className="grid grid-cols-2 gap-3">
                      <CustomDropdown
                        label="AWS Region"
                        options={AWS_REGIONS}
                        value={res.aws_region}
                        onChange={(v) => setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_region: v } : r))}
                      />
                      <CustomDropdown
                        label="Service"
                        options={AVAILABLE_SERVICES.map((s) => ({ value: s, label: s }))}
                        value={res.aws_service}
                        onChange={(v) => handleServiceChange(idx, v)}
                        placeholder="Select Service"
                      />
                    </div>
                    {res.aws_service && (
                      <CustomDropdown
                        label={res.aws_service === "ECS" ? "Cluster" : `${res.aws_service} Resource`}
                        options={resourceOpts}
                        value={res.aws_resource}
                        onChange={async (v) => {
                          setResources((p) => p.map((r, i) => i === idx ? { ...r, aws_resource: v } : r));
                          if (res.aws_service === "ECS" && v) {
                            setLoadingEcsTasks((p) => ({ ...p, [idx]: true }));
                            try {
                              const data = await awsService.getECSTasks(v);
                              setEcsTasks((p) => ({ ...p, [idx]: data.data || data }));
                            } catch {
                              toast.error("Failed to load ECS tasks");
                            } finally {
                              setLoadingEcsTasks((p) => ({ ...p, [idx]: false }));
                            }
                          }
                        }}
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/5 bg-[#fdfcf9] flex justify-end items-center gap-2">
          <Button variant="secondary" onClick={onClose} width="w-auto" className="cursor-pointer text-xs h-9 border border-black/5">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={submitting}
            disabled={!branch || submitting}
            icon={submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            width="w-auto"
            className="cursor-pointer text-xs h-9"
          >
            {submitting ? "Adding..." : "Add Environment"}
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};