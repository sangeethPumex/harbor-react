"use client";

import React, { useRef, useEffect, useState } from "react";

export type TabData =
  | [string, string]
  | [string, string, { icon?: React.ReactNode; disabled?: boolean }];

interface TabsProps {
  data: TabData[];
  activeTab: string;
  setActiveTab: (value: string) => void;
  fullWidth?: boolean;
  className?: string;
}

const PADDING = 4; // px — must match p-[4px] on the wrapper

export const Tabs = ({
  data,
  activeTab,
  setActiveTab,
  fullWidth = false,
  className = "",
}: TabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const index = data.findIndex(([value]) => value === activeTab);
    const container = containerRef.current;
    if (!container || index === -1) return;

    const button = container.children[index];
    if (button instanceof HTMLElement) {
      setSliderStyle({
        left: button.offsetLeft + PADDING,
        width: button.offsetWidth,
      });
    }
  }, [activeTab, data]);

  return (
    <div
      className={`relative inline-flex rounded-md border border-[rgba(60,50,40,0.12)] bg-[#fdfcf9] p-[4px] select-none ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {/* Sliding pill — uses button primary color (terracotta) */}
      <div
        className="pointer-events-none absolute top-[4px] z-0 h-[calc(100%-8px)] rounded-[5px] bg-primary transition-all duration-250 ease-in-out"
        style={sliderStyle}
      />

      {/* Buttons */}
      <div
        ref={containerRef}
        className={`relative z-10 inline-flex ${fullWidth ? "w-full" : ""}`}
      >
        {data.map((tabData, i) => {
          const [value, label, options = {}] = tabData;
          const { icon, disabled } = options as { icon?: React.ReactNode; disabled?: boolean };
          const isActive = activeTab === value;

          return (
            <button
              key={value + i}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) setActiveTab(value);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-[5px] px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
                fullWidth ? "flex-1" : ""
              } ${
                disabled
                  ? "cursor-not-allowed opacity-40 text-[#6b5e52]"
                  : isActive
                  ? "cursor-pointer text-white"
                  : "cursor-pointer text-[#6b5e52] hover:text-[#1a1a1a]"
              }`}
            >
              {icon && <span className="shrink-0 leading-none">{icon}</span>}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
