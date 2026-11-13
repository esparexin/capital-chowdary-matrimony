"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, UserPlus } from "lucide-react";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import {
  REGISTRATION_FORM_ID,
  REGISTRATION_SUBMIT_STATE_EVENT,
} from "@/features/registration/registration-schema";

interface MobileStickyCtaProps {
  callHref: string;
  whatsappHref: string;
  emailHref: string;
}

/**
 * Sticky bottom quick-action bar on mobile viewports.
 * Adapts per route cleanly: WhatsApp submit on `/register`, 3-channel bar on `/contact`, and
 * Register + Call Now on all other public pages.
 */
export function MobileStickyCta({ callHref, whatsappHref, emailHref }: MobileStickyCtaProps) {
  const pathname = usePathname();
  const isRegisterRoute = pathname === "/register";
  const isContactRoute = pathname === "/contact";
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleState = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      setIsSubmitting(Boolean(customEvent.detail));
    };
    window.addEventListener(REGISTRATION_SUBMIT_STATE_EVENT, handleState);
    return () => window.removeEventListener(REGISTRATION_SUBMIT_STATE_EVENT, handleState);
  }, []);

  const regionLabel = isRegisterRoute
    ? "Registration submission"
    : isContactRoute
      ? "Direct contact channels"
      : "Quick actions";

  return (
    <div
      role="region"
      aria-label={regionLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#C5A15A]/40 bg-[#FAF8F3]/95 pt-2 pr-[max(0.75rem,env(safe-area-inset-right,0px))] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pl-[max(0.75rem,env(safe-area-inset-left,0px))] shadow-[0_-4px_16px_rgba(112,36,59,0.08)] backdrop-blur-sm md:hidden"
    >
      {isRegisterRoute ? (
        <div className="mx-auto max-w-lg">
          <button
            type="submit"
            form={REGISTRATION_FORM_ID}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#128C7E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <WhatsAppIcon />
            )}
            <span>Send via WhatsApp</span>
          </button>
        </div>
      ) : isContactRoute ? (
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg bg-[#25D366] px-2 py-1.5 text-xs font-semibold leading-tight text-white shadow-xs transition-colors hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#128C7E] focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="size-4.5 shrink-0" />
            <span>WhatsApp</span>
          </a>

          <a
            href={callHref}
            className="inline-flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg bg-[#70243B] px-2 py-1.5 text-xs font-semibold leading-tight text-[#FAF8F3] shadow-xs transition-colors hover:bg-[#5B1C2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2"
          >
            <Phone className="size-4.5 shrink-0" aria-hidden="true" />
            <span>Phone</span>
          </a>

          <a
            href={emailHref}
            className="inline-flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-[#C5A15A] bg-white px-2 py-1.5 text-xs font-semibold leading-tight text-[#70243B] shadow-xs transition-colors hover:bg-[#F3ECE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2"
          >
            <Mail className="size-4.5 shrink-0" aria-hidden="true" />
            <span>Email</span>
          </a>
        </div>
      ) : (
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2.5">
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#70243B] px-3 py-2 text-sm font-semibold text-[#FAF8F3] shadow-xs transition-colors hover:bg-[#5B1C2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2"
          >
            <UserPlus className="size-4 shrink-0" aria-hidden="true" />
            <span>Register</span>
          </Link>

          <a
            href={callHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#C5A15A] bg-white px-3 py-2 text-sm font-semibold text-[#70243B] shadow-xs transition-colors hover:bg-[#F3ECE0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2"
          >
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            <span>Call Now</span>
          </a>
        </div>
      )}
    </div>
  );
}
