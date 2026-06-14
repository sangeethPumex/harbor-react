"use client";

import React, { useRef } from "react";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  error?: string;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = value.split("");
    newOtp[index] = val.slice(-1);

    const updated = newOtp.join("");
    onChange(updated);

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;

    const newOtp = paste.slice(0, length).split("");
    onChange(newOtp.join(""));

    newOtp.forEach((_, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = newOtp[i] || "";
      }
    });

    inputsRef.current[Math.min(newOtp.length, length - 1)]?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between gap-2">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            disabled={disabled}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            className={`
              w-12 h-12 text-center text-lg font-medium
              rounded-md
              bg-[#fdfcf9]
              text-[#2b2622]
              placeholder:text-[#9b8f84]
              shadow-[inset_0_0_0_1px_rgba(60,50,40,0.12)]
              focus:outline-none
              focus:shadow-[inset_0_0_0_1px_rgba(255,120,60,0.5),0_0_0_3px_rgba(255,120,60,0.08)]
              transition-all duration-150
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          />
        ))}
      </div>
      {error && (
        <span className="text-xs font-light text-[#AE3020]">
          {error}
        </span>
      )}
    </div>
  );
};

export default OtpInput;
