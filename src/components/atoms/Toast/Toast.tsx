"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  const toast = (message: string, type: "success" | "info" | "error" = "success") => {
    if (type === "success") {
      sonnerToast.success(message);
    } else if (type === "error") {
      sonnerToast.error(message);
    } else {
      sonnerToast.info(message);
    }
  };

  return { toast };
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
