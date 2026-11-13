import Link from "next/link";
import { BrandLogo } from "@/components/shared/BrandLogo";
import {
  type SiteContactDetails,
  VERIFIED_CONTACT_DEFAULTS,
} from "@/features/contact/site-contact";

interface SiteFooterProps {
  contact?: SiteContactDetails;
}

export function SiteFooter({ contact = VERIFIED_CONTACT_DEFAULTS }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#C5A15A]/35 bg-[#FAF8F3] text-sm text-[#3D272E]">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-9" />
            <div>
              <p className="font-serif text-lg font-semibold text-[#70243B]">
                {contact.businessNameEn}
              </p>
              <p lang="te" className="mixed-script-text text-xs font-medium text-[#593E46]">
                {contact.businessNameTe} &middot; {contact.mottoTe}
              </p>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#593E46] sm:justify-end sm:text-sm"
          >
            <Link href="/about" className="transition-colors hover:text-[#70243B]">
              About Us
            </Link>
            <Link href="/contact" className="transition-colors hover:text-[#70243B]">
              Contact Us
            </Link>
            <Link href="/register" className="transition-colors hover:text-[#70243B]">
              Register
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-[#70243B]">
              Privacy Policy
            </Link>
          </nav>
        </div>

        <div className="border-t border-[#C5A15A]/25 pt-3 space-y-2 text-xs text-[#593E46]">
          <p className="text-center sm:text-left">
            &copy; {currentYear} {contact.businessNameEn}.
          </p>
          <p className="text-center text-xs text-[#593E46]">
            Crafted with{" "}
            <span className="text-[#8B1E3F]" aria-label="love">
              ♥
            </span>{" "}
            by{" "}
            <a
              href="https://palnadu.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#70243B] underline decoration-[#C5A15A]/60 underline-offset-2 transition-colors hover:text-[#5B1C2F] hover:decoration-[#70243B]"
            >
              Palnadu.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
