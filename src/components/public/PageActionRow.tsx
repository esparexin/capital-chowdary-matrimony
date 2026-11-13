import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PageActionRowProps {
  children: ReactNode;
  className?: string;
  withBottomClearance?: boolean;
}

export const pageActionPrimaryClass =
  "inline-flex min-h-11 flex-1 min-w-0 items-center justify-center rounded-lg bg-[#70243B] px-1.5 py-2.5 text-center text-[0.6875rem] font-semibold text-[#FAF8F3] transition-colors hover:bg-[#5B1C2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2 min-[360px]:px-2.5 min-[360px]:text-xs min-[390px]:px-4 min-[390px]:text-sm md:flex-initial md:min-w-fit md:px-5 md:py-2.5 md:text-sm";

export const pageActionSecondaryClass =
  "inline-flex min-h-11 flex-1 min-w-0 items-center justify-center rounded-lg border border-[#C5A15A] bg-white px-1.5 py-2.5 text-center text-[0.6875rem] font-semibold text-[#70243B] transition-colors hover:bg-[#FAF8F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2 min-[360px]:px-2.5 min-[360px]:text-xs min-[390px]:px-4 min-[390px]:text-sm md:flex-initial md:min-w-fit md:px-5 md:py-2.5 md:text-sm";

/**
 * Shared mobile-first side-by-side action row for page-end or section-end button pairs.
 * - Mobile (< 768px): renders a horizontal flex row with flex: 1 1 0, min-w-0, equal-width buttons
 *   and 64px bottom clearance to prevent overlap with MobileStickyCta.
 * - Desktop (>= 768px): reverts to standard inline-flex wrap layout with zero bottom clearance.
 */
export function PageActionRow({
  children,
  className,
  withBottomClearance = true,
}: PageActionRowProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center gap-2.5 min-[375px]:gap-3 md:inline-flex md:w-auto md:flex-wrap",
        withBottomClearance && "pb-16 md:pb-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
