"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const json = (await response.json().catch(() => null)) as {
        ok: boolean;
        error?: { message?: string };
      } | null;

      if (!response.ok || !json?.ok) {
        setErrorMessage(
          json?.error?.message || "Invalid credentials or login is temporarily locked.",
        );
        setIsLoading(false);
        return;
      }

      const nextParam = searchParams.get("next");
      const destination =
        nextParam && nextParam.startsWith("/admin") && !nextParam.startsWith("//")
          ? nextParam
          : "/admin/dashboard";

      router.push(destination);
      router.refresh();
    } catch {
      setErrorMessage("Network error connecting to administration service. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-900"
        >
          {errorMessage}
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="block text-xs font-semibold text-[#593E46]">
          Administrator Email
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="size-4 text-[#C5A15A]" />
          </div>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@capitalchowdarymatrimony.com"
            disabled={isLoading}
            className="block w-full rounded-lg border border-[#C5A15A]/50 bg-white py-2.5 pr-3 pl-9 text-sm text-[#3D272E] placeholder-[#593E46]/50 shadow-2xs focus:border-[#70243B] focus:ring-2 focus:ring-[#70243B]/20 focus:outline-none disabled:bg-[#FAF8F3]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="admin-password" className="block text-xs font-semibold text-[#593E46]">
          Password
        </label>
        <div className="relative mt-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="size-4 text-[#C5A15A]" />
          </div>
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            disabled={isLoading}
            className="block w-full rounded-lg border border-[#C5A15A]/50 bg-white py-2.5 pr-10 pl-9 text-sm text-[#3D272E] placeholder-[#593E46]/50 shadow-2xs focus:border-[#70243B] focus:ring-2 focus:ring-[#70243B]/20 focus:outline-none disabled:bg-[#FAF8F3]"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#593E46] hover:text-[#70243B]"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#70243B] px-5 py-2.5 text-sm font-semibold text-[#FAF8F3] shadow-xs transition-colors hover:bg-[#5B1C2F] focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
      >
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        <span>{isLoading ? "Signing In..." : "Sign In to Administration"}</span>
      </button>
    </form>
  );
}
