"use client";

import React, { useEffect, useState } from "react";

export interface ChartData {
  label: string;
  shortLabel: string;
  value: number;
}

interface DeploymentChartProps {
  data: ChartData[];
}

export const DeploymentChart: React.FC<DeploymentChartProps> = ({ data }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger transition animation on mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...data.map((d) => d.value)) || 10;

  return (
    <div className="w-full flex flex-col h-[280px]">
      {/* Grid chart area */}
      <div className="flex-1 flex items-end justify-between gap-4 px-2 relative border-b border-black/5 pb-2">
        {/* Y Axis Guide lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2">
          <div className="border-t border-black/5 w-full" />
          <div className="border-t border-black/5 w-full" />
          <div className="border-t border-black/5 w-full" />
          <div className="border-t border-black/5 w-full" />
        </div>

        {data.map((item, idx) => {
          // Calculate height percentage
          const targetHeight = (item.value / maxValue) * 100;
          const currentHeight = mounted ? targetHeight : 0;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center group cursor-pointer relative z-10"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-10 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-[#1a1a1a] text-white text-xs px-2 py-1 rounded-md transition-all duration-200 pointer-events-none shadow-md whitespace-nowrap">
                {item.value} deploys
              </div>

              {/* Animated Bar */}
              <div className="w-10 max-w-full bg-[#fdfcf9] border border-black/5 rounded-t-md overflow-hidden flex items-end h-[180px] transition-colors duration-200">
                <div
                  className="w-full bg-[#d08873] hover:bg-[#be7560] rounded-t-sm transition-all duration-700 ease-out"
                  style={{ height: `${currentHeight}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X Axis labels */}
      <div className="flex items-center justify-between gap-4 mt-3 px-2 select-none">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 text-center">
            <span
              className="text-[11px] text-[#8a7f75] block truncate"
              title={item.label}
            >
              {item.shortLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
