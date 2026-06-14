"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="min-h-screen w-full flex bg-white font-sans animate-fade-in">
      {/* Left Pane - Visual Graphic */}
      <div className="hidden md:flex md:w-[38%] p-6 bg-brand-bg select-none shrink-0 h-screen sticky top-0">
        <div className="w-full h-full relative overflow-hidden rounded-2xl border border-border-warm shadow-inner flex items-center justify-center">
          {/* Render the Login-Side-image.svg */}
          <img
            src="/Login-Side-image.svg"
            alt="Harbor Portal Landscape"
            className="absolute inset-0 w-full h-full object-cover animate-scale-in"
            draggable={false}
          />
        </div>
      </div>

      {/* Right Pane - Form content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-16 lg:px-24 bg-white relative overflow-y-auto">
        <div className="w-full max-w-md py-12 animate-slide-up">
          {children}
        </div>
      </div>
    </main>
  );
};
