"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Key, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { OtpInput } from "@/components/atoms/OtpInput/OtpInput";
import { Tabs } from "@/components/atoms/Tabs/Tabs";

type LoginMode = "pin" | "password";

export default function LoginPage() {
  const router = useRouter();
  const [loginMode, setLoginMode] = useState<LoginMode>("pin");
  const [email, setEmail] = useState("sangeeth@pumexinfotech.com");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    if (loginMode === "pin" && pin.length !== 6) {
      setError("Please enter your 6-digit PIN");
      return;
    }

    if (loginMode === "password" && !password) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    
    // Simulate authorization response delay
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("harbor_logged_in", "true");
      router.push("/dashboard");
    }, 1200);
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[40%_60%] bg-white font-sans animate-fade-in">
      {/* LEFT SIDE – Decorative Image */}
      <div className="hidden lg:flex items-center justify-center py-2 pl-2">
        <div className="w-full h-full relative overflow-hidden rounded-md border border-border-warm shadow-inner">
          {/* Render the Login-Side-image.svg */}
          <img
            src="/Login-Side-image.svg"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover animate-scale-in"
            draggable={false}
          />

          {/* Branded Overlay */}
          <div className="absolute inset-0 bg-black/10 flex flex-col justify-end p-12 text-white">
            <h2 className="text-3xl font-semibold mb-2">Harbor</h2>
            <p className="text-white/80 max-w-sm">Built for the bay. Designed for the desk.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="flex justify-center opacity-90 select-none">
            {/* Harbor Logo */}
            <img src="/harbor-logo.svg" alt="Harbor Logo" className="h-8 w-auto" />
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-[26px] leading-[1.2] font-medium tracking-tight text-[#1a1a1a]">
              Secure Access
            </h1>
            <p className="text-[#6b5e52] text-sm leading-relaxed">
              Unlock your workspace using your PIN or password.
            </p>
          </div>

          {/* Login Mode Toggle */}
          <Tabs
            data={[
              ["pin", "Quick PIN", { icon: <Key size={14} /> }],
              ["password", "Password", { icon: <Lock size={14} /> }],
            ]}
            activeTab={loginMode}
            setActiveTab={(v) => setLoginMode(v as LoginMode)}
            fullWidth
          />

          {/* Error Message */}
          {error && (
            <div className="bg-status-danger-bg text-status-danger-text text-xs font-semibold px-3 py-2 rounded-lg border border-status-danger-text/20 animate-fade-in text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {/* Email Address */}
            <InputField
              label="Email Address"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              iconLeft={<UserIcon size={18} className="text-[#8a7f75]" />}
            />

            {/* Input PIN or Password */}
            {loginMode === "pin" ? (
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#1a1a1a]">Enter 6-digit PIN</label>
                <OtpInput value={pin} onChange={setPin} disabled={loading} />
              </div>
            ) : (
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            )}

            {/* Remember Me and Forgot PIN */}
            <div className="flex items-center justify-between pb-2 select-none">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4.5 w-4.5 rounded-md border-border-warm text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                />
                <span className="text-xs font-semibold text-text-muted group-hover:text-text-dark transition-colors duration-200">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-xs text-[#8a7f75] hover:text-[#1a1a1a] transition-colors font-semibold cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>

            {/* Unlock Button */}
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              label={loginMode === "pin" ? "Unlock Workspace" : "Login"}
              className="w-full h-12 text-base font-semibold cursor-pointer"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
