"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { SITE_CONFIG } from "@/config/site-config";
import { PUBLIC_NAV_ITEMS } from "@/constants/navigation";

/**
 * Accessible mobile and small-tablet navigation drawer backed by a native modal `<dialog>`.
 */
export function MobileNavDrawer() {
  const drawerId = useId();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
  }, [pathname]);

  function openDrawer() {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setIsOpen(true);
  }

  function closeDrawer() {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
  }

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) return;
    if (event.clientX === 0 && event.clientY === 0) return;

    const rect = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;

    if (clickedOutside) {
      closeDrawer();
    }
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls={drawerId}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#C5A15A]/50 bg-[#FAF8F3] text-[#70243B] transition-colors hover:bg-[#F3ECE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        id={drawerId}
        aria-labelledby={`${drawerId}-title`}
        onClose={() => setIsOpen(false)}
        onClick={handleDialogClick}
        className="mobile-nav-drawer m-0 ml-auto h-[100dvh] max-h-none w-[min(20rem,85dvw)] max-w-none border-l border-[#C5A15A]/45 bg-[#FAF8F3] p-0 text-foreground shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#C5A15A]/30 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandLogo className="h-8" />
            <span
              id={`${drawerId}-title`}
              className="truncate font-serif text-base font-semibold text-[#70243B]"
            >
              {SITE_CONFIG.brandName}
            </span>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            autoFocus
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-[#C5A15A]/40 bg-[#FAF8F3] text-[#70243B] transition-colors hover:bg-[#F3ECE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeDrawer}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      isActive
                        ? "flex min-h-11 items-center rounded-lg border-l-4 border-[#C5A15A] bg-[#70243B] px-3.5 py-2.5 text-sm font-semibold text-[#FAF8F3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
                        : "flex min-h-11 items-center rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#2F1D22] transition-colors hover:bg-white hover:text-[#70243B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
                    }
                  >
                    {item.defaultLabel}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </dialog>
    </div>
  );
}
