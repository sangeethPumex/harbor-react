"use client";

import React from "react";

export type InputVariant = "primary" | "secondary" | "disabled";

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "width"> {
  label?: React.ReactNode;
  width?: string;
  variant?: InputVariant;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  name?: string;
  id?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  iconLeft?: React.ReactNode;
  defaultValue?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  width = "w-full",
  variant = "primary",
  value,
  onChange,
  placeholder,
  type = "text",
  name,
  id,
  required,
  error,
  hint,
  className,
  iconLeft,
  defaultValue,
  ...props
}) => {
  // Build controlled vs uncontrolled props to avoid the read-only field warning
  const valueProps =
    value !== undefined
      ? { value, onChange: onChange ?? (() => {}) }
      : defaultValue !== undefined
      ? { defaultValue }
      : {};
  const isDisabled = variant === "disabled";

  return (
    <div className={`flex flex-col ${width}`}>
      {label && (
        <label className="mb-1.5 text-sm font-medium text-[#3a312a] select-none">
          {label}
          {required && <span className="ml-0.5 text-[#c25b3c]">*</span>}
        </label>
      )}

      <div
        className={`
          relative flex items-center rounded-md
          bg-[#fdfcf9]
          shadow-[inset_0_0_0_1px_rgba(60,50,40,0.12)]
          transition-all duration-200
          focus-within:shadow-[inset_0_0_0_1px_rgba(255,120,60,0.4),0_0_0_3px_rgba(255,120,60,0.08)]
          ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {iconLeft && <div className="pl-3 text-[#8a7f75]">{iconLeft}</div>}

        <input
          type={type}
          {...valueProps}
          placeholder={placeholder}
          name={name}
          id={id}
          required={required}
          disabled={isDisabled}
          className={`
            w-full bg-transparent px-3 py-2.5 text-sm
            text-[#2b2622]
            placeholder:text-[#9b8f84]
            focus:outline-none
            ${iconLeft ? "pl-2" : ""}
            ${className || ""}
          `}
          {...props}
        />
      </div>

      {error && <span className="mt-1.5 text-xs text-[#c25b3c]">{error}</span>}
      {hint && !error && <span className="mt-1.5 text-xs text-[#8a7f75]">{hint}</span>}
    </div>
  );
};

export default InputField;
