"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error" | "success";
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", variant = "default", icon, type = "text", disabled, ...props }, ref) => {
    // Styling with focus transitions and hover micro-animations
    const baseStyle =
      "w-full text-sm font-medium rounded-lg border bg-white text-text-dark placeholder:text-text-light/70 focus:outline-none transition-all duration-300 ease-in-out disabled:opacity-50 disabled:bg-brand-bg/50 disabled:pointer-events-none";
    
    const variants = {
      default:
        "border-border-warm focus:border-primary/60 focus:ring-4 focus:ring-primary/10 hover:border-text-light/40",
      error:
        "border-status-danger-text focus:border-status-danger-text focus:ring-4 focus:ring-status-danger-text/10",
      success:
        "border-status-success-text focus:border-status-success-text focus:ring-4 focus:ring-status-success-text/10",
    };

    const iconPadding = icon ? "pl-10" : "pl-4";

    return (
      <div className="relative w-full group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center justify-center pointer-events-none text-text-light/80 group-focus-within:text-primary transition-colors duration-300">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`${baseStyle} ${variants[variant]} ${iconPadding} pr-4 py-2.5 ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
