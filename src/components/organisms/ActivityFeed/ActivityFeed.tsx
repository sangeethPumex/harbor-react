"use client";

import React from "react";
import { Play } from "lucide-react";

export interface ActivityItem {
  id: string;
  project: string;
  status: "deploying" | "active" | "idle" | "deployed" | "error";
  user: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const statusColors = {
    deploying: {
      text: "text-[#e65100] bg-[#fff3e0]",
      dot: "bg-[#e65100]",
      label: "deploying",
    },
    active: {
      text: "text-[#2e7d32] bg-[#e8f5e9]",
      dot: "bg-[#2e7d32]",
      label: "active",
    },
    idle: {
      text: "text-[#8a7f75] bg-[#fdfcf9]",
      dot: "bg-[#8a7f75]",
      label: "idle",
    },
    deployed: {
      text: "text-[#1565c0] bg-[#e3f2fd]",
      dot: "bg-[#1565c0]",
      label: "deployed",
    },
    error: {
      text: "text-[#c62828] bg-[#ffebee]",
      dot: "bg-[#c62828]",
      label: "error",
    },
  };

  return (
    <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
      {activities.map((act) => {
        const style = statusColors[act.status];
        return (
          <div
            key={act.id}
            className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-md hover:shadow-sm hover:border-[#d08873]/20 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {/* Play Icon Box */}
              <div
                className={`h-8 w-8 rounded-md border border-black/5 flex items-center justify-center transition-colors duration-200 ${
                  act.status === "error"
                    ? "text-[#c62828] bg-[#ffebee]"
                    : act.status === "deploying"
                    ? "text-[#e65100] bg-[#fff3e0]"
                    : act.status === "active"
                    ? "text-[#2e7d32] bg-[#e8f5e9]"
                    : "text-[#8a7f75] bg-[#fdfcf9]"
                }`}
              >
                <Play size={13} fill="currentColor" className="translate-x-[0.5px]" />
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-[#1a1a1a] truncate">
                  {act.project}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-sm ${style.text}`}
                  >
                    <span className={`h-1 w-1 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                  <span className="text-[11px] font-medium text-[#8a7f75]">
                    &bull; {act.user}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
