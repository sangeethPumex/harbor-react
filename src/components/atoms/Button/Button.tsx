"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export type ButtonVariant = "primary" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | "onDrag"
    | "onDragStart"
    | "onDragEnd"
    | "onAnimationStart"
    | "onAnimationEnd"
    | "onAnimationIteration"
  > {
  variant?: ButtonVariant;
  size?: ButtonSize;
  width?: string;
  label?: string;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  width = "w-full",
  className,
  children,
  label,
  isLoading = false,
  icon,
  iconPosition = "left",
  ...props
}) => {
  const isDisabled = isLoading || !!props.disabled;

  const baseStyles =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold tracking-[0.02em] transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: `
      bg-primary text-white
      hover:bg-primary-hover
      shadow-sm shadow-primary/10 hover:shadow-md hover:shadow-primary/15
    `,
    secondary: `
      bg-white text-text-dark
      hover:bg-brand-bg
      border border-border-warm
    `,
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3.5 py-1.5 text-xs rounded-md",
    md: "px-5 py-2.5 text-sm rounded-md",
    lg: "px-6 py-3 text-base rounded-lg",
  };

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${width} ${className || ""}`}
      whileHover={!isDisabled ? { scale: 1.015, y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.985 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      disabled={isDisabled}
      {...props}
    >
      {/* Ambient gradient glow (matches your image palette) */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(208,136,115,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(142,122,111,0.2),transparent_60%)]" />
      </div>

      <span className="relative z-10 flex items-center gap-2">
        {isLoading && <Loader2 className="animate-spin" size={16} />}
        {!isLoading && icon && iconPosition === "left" && (
          <span className="flex items-center justify-center shrink-0">{icon}</span>
        )}
        <span>{label || children}</span>
        {!isLoading && icon && iconPosition === "right" && (
          <span className="flex items-center justify-center shrink-0">{icon}</span>
        )}
      </span>
    </motion.button>
  );
};

export default Button;
