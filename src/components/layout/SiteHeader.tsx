import Link from "next/link";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { PUBLIC_NAV_ITEMS } from "@/constants/navigation";
import { SITE_CONFIG } from "@/config/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2.5 px-4 py-2.5 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:gap-3"
        >
          <BrandLogo className="h-8 sm:h-11" priority />
          <span className="truncate font-serif text-[0.9375rem] font-semibold tracking-tight text-foreground sm:text-xl">
            {SITE_CONFIG.brandName}
          </span>
        </Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-5 lg:flex">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.defaultLabel}
            </Link>
          ))}
        </nav>
        <MobileNavDrawer />
      </div>
    </header>
  );
}
