"use client";

import React from "react";
import { Input, InputProps } from "@/components/atoms/Input/Input";

export interface FormFieldProps extends Omit<InputProps, "variant"> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "error" | "success";
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, variant = "default", className = "", id, ...props }, ref) => {
    // Resolve variant based on error message presence
    const resolvedVariant = error ? "error" : variant;

    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-bold text-text-dark/95 uppercase tracking-wider select-none"
          >
            {label}
          </label>
        )}
        <Input ref={ref} id={id} variant={resolvedVariant} {...props} />
        {error && (
          <p className="text-xs font-semibold text-status-danger-text animate-fade-in">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-text-light">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
