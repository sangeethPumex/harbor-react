"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Key, Check } from "lucide-react";
import { Button } from "@/components/atoms/Button/Button";
import { InputField } from "@/components/atoms/InputField/InputField";
import { OtpInput } from "@/components/atoms/OtpInput/OtpInput";
import { toast } from "sonner";
import { z } from "zod";
import { authService } from "@/services/auth_service";

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Invalid Link</h1>
        <p className="text-[#6b5e52] text-sm">
          The setup token is missing. Please check your invite email or contact your administrator.
        </p>
        <Button
          variant="secondary"
          label="Back to Login"
          onClick={() => router.push("/login")}
          className="mx-auto"
          width="w-auto"
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const pinSchema = z.string().length(6, "PIN must be exactly 6 digits").regex(/^\d+$/, "PIN must contain only numbers");
    const pinResult = pinSchema.safeParse(pin);
    if (!pinResult.success) {
      toast.error(pinResult.error.issues[0]?.message || "Invalid PIN");
      return;
    }

    setLoading(true);

    try {
      await authService.setupPassword({
        token,
        password,
        pin,
      });

      toast.success("Account password and PIN setup successfully!");
      router.push("/login");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || "An unexpected error occurred";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InputField
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        required
        iconLeft={<Lock size={18} className="text-[#8a7f75]" />}
      />

      <InputField
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
        required
        iconLeft={<Lock size={18} className="text-[#8a7f75]" />}
      />

      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1a1a1a]">Set 6-digit Quick PIN</label>
        <OtpInput value={pin} onChange={setPin} disabled={loading} />
        <p className="text-[11px] text-[#8a7f75]">You will use this PIN for quick access to the workspace.</p>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        label="Complete Setup"
        icon={<Check size={16} />}
        className="w-full h-12 text-base font-semibold cursor-pointer"
      />
    </form>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[40%_60%] bg-white font-sans animate-fade-in">
      {/* LEFT SIDE – Decorative Image */}
      <div className="hidden lg:flex items-center justify-center py-2 pl-2">
        <div className="w-full h-full relative overflow-hidden rounded-md border border-border-warm shadow-inner">
          <img
            src="/Login-Side-image.svg"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover animate-scale-in"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/10 flex flex-col justify-end p-12 text-white">
            <h2 className="text-3xl font-semibold mb-2">Harbor</h2>
            <p className="text-white/80 max-w-sm">Secure authorization setup for your bay.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE – Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          <div className="flex justify-center opacity-90 select-none">
            <img src="/harbor-logo.svg" alt="Harbor Logo" className="h-8 w-auto" />
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-[26px] leading-[1.2] font-medium tracking-tight text-[#1a1a1a]">
              Setup Account
            </h1>
            <p className="text-[#6b5e52] text-sm leading-relaxed">
              Create your secure password and PIN to access your new account.
            </p>
          </div>

          <Suspense fallback={<div className="text-center text-sm text-[#8a7f75]">Loading setup...</div>}>
            <SetupPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
