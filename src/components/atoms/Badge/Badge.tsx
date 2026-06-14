"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "neutral",
  showDot = false,
  children,
  ...props
}) => {
  const baseStyle =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full select-none transition-colors duration-200";

  const variants = {
    success: "bg-status-success-bg text-status-success-text",
    warning: "bg-status-warning-bg text-status-warning-text",
    danger: "bg-status-danger-bg text-status-danger-text",
    info: "bg-status-info-bg text-status-info-text",
    neutral: "bg-brand-bg text-text-muted border border-border-warm",
  };

  const dotColors = {
    success: "bg-status-success-text",
    warning: "bg-status-warning-text",
    danger: "bg-status-danger-text",
    info: "bg-status-info-text",
    neutral: "bg-text-muted",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      <span>{children}</span>
    </span>
  );
};
