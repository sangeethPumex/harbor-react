"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("harbor_logged_in");
    if (loggedIn === "true") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary-light/40 flex items-center justify-center animate-pulse">
          <svg
            className="h-5 w-5 text-primary animate-spin"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="7" cy="7" r="4" />
            <circle cx="17" cy="7" r="4" fillOpacity="0.65" />
            <circle cx="7" cy="17" r="4" fillOpacity="0.65" />
            <circle cx="17" cy="17" r="4" />
          </svg>
        </div>
        <span className="text-xs font-bold text-text-light">Loading Harbor...</span>
      </div>
    </div>
  );
}
