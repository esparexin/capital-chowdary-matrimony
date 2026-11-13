"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch {
      // Proceed to login redirect even if network fails
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="Sign out of administration"
      className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#C5A15A]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#70243B] shadow-2xs transition-colors hover:bg-[#FAF8F3] hover:text-[#5B1C2F] disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="size-3.5 animate-spin text-[#70243B]" />
      ) : (
        <LogOut className="size-3.5 text-[#70243B]" />
      )}
      <span>{isLoading ? "Signing Out..." : "Sign Out"}</span>
    </button>
  );
}
