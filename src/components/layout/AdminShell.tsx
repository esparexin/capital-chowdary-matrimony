"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { SITE_CONFIG } from "@/config/site-config";
import { ADMIN_NAV_ITEMS } from "@/constants/navigation";
import type { AuthenticatedAdminUser } from "@/lib/auth/session-service";

interface AdminShellProps {
  children: ReactNode;
  user?: AuthenticatedAdminUser;
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 text-sm font-semibold text-foreground"
          >
            <BrandLogo className="h-9" />
            <span>{SITE_CONFIG.shortName} Content Admin</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                {user.name} ({user.email})
              </span>
            )}
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Public Site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 md:grid-cols-[220px_1fr]">
        <aside
          aria-label="Administrator navigation"
          className="rounded-xl border border-border bg-card p-2 md:p-3"
        >
          <nav className="flex flex-row gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors sm:text-sm md:py-2 ${
                    isActive
                      ? "bg-primary font-semibold text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.defaultLabel}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
