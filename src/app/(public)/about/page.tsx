import type { Metadata } from "next";
import Link from "next/link";
import { Images } from "lucide-react";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { ContactInfoCards } from "@/components/public/ContactInfoCards";
import {
  PageActionRow,
  pageActionPrimaryClass,
  pageActionSecondaryClass,
} from "@/components/public/PageActionRow";
import { getSiteContactDetails } from "@/features/contact/site-contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Capital Chowdary Matrimony in Narasaraopet, Palnadu District — Kamma (Chowdary) marriage bureau run by Indlamuri Ramesh Babu serving Andhra Pradesh and Telangana.",
};

export default async function AboutPage() {
  const contact = await getSiteContactDetails();

  return (
    <div className="-mt-6 space-y-6 sm:-mt-4">
      <section
        aria-labelledby="about-heading"
        className="rounded-2xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5 shadow-xs sm:p-7"
      >
        <div
          lang="te"
          className="mixed-script-text mb-4 rounded-xl border border-[#C5A15A]/35 bg-white/90 px-4 py-3"
        >
          <p className="text-base font-semibold text-[#70243B] sm:text-lg">
            {contact.businessNameTe}
          </p>
          <p className="mt-0.5 text-sm font-medium text-[#593E46] sm:text-[15px]">
            {contact.mottoTe}
          </p>
        </div>

        <h1
          id="about-heading"
          className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#70243B] sm:text-3xl"
        >
          About Capital Chowdary Matrimony
        </h1>

        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#70243B]">
          {contact.businessNameEn}
        </p>

        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#3D272E] sm:text-[15px]">
          <p>
            Capital Chowdary Matrimony is a Kamma (Chowdary) marriage bureau run by{" "}
            <strong className="font-semibold text-[#2F1D22]">{contact.founderName}</strong> from
            Narasaraopet, Palnadu District, serving families across Andhra Pradesh and Telangana.
          </p>
          <p>
            We introduce suitable alliances for software employees, doctors, NRIs, business and
            government employees, and for divorced and late marriages. We also organise marriage
            events and maintain a verified community photo gallery.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="association-heading"
        className="rounded-2xl border border-[#C5A15A]/45 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <BrandLogo className="h-11 sm:h-12" />
            <div>
              <h2
                id="association-heading"
                className="font-serif text-xl font-semibold text-[#70243B] sm:text-2xl"
              >
                Association Details
              </h2>
              <p className="mt-1 text-sm font-semibold text-[#2F1D22] sm:text-base">
                {contact.association.name}
              </p>
              <p className="mt-0.5 text-sm text-[#593E46]">
                Registration Number:{" "}
                <span className="font-semibold text-[#70243B]">
                  {contact.association.registrationNumber}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="about-gallery-heading"
        className="rounded-2xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5 shadow-xs sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="about-gallery-heading"
              className="font-serif text-xl font-semibold text-[#70243B] sm:text-2xl"
            >
              Photo Gallery &amp; Event Updates
            </h2>
            <p className="mt-1 text-sm text-[#593E46]">
              Browse verified bureau photographs, community gathering moments, and marriage event
              archives.
            </p>
            <p lang="te" className="mixed-script-text mt-0.5 text-xs text-[#70243B]">
              వివాహ వేడుకలు, ముహూర్తం వివరాలు మరియు ఫోటోల గ్యాలరీని వీక్షించండి.
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#70243B] px-4 py-2 text-sm font-semibold text-[#FAF8F3] shadow-xs transition-colors hover:bg-[#5B1C2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
          >
            <Images className="size-4" aria-hidden="true" />
            <span>View Gallery</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="about-contact-heading" className="space-y-3">
        <h2
          id="about-contact-heading"
          className="font-serif text-xl font-semibold text-[#70243B] sm:text-2xl"
        >
          Contact Information
        </h2>
        <ContactInfoCards contact={contact} addressVariant="about" showTimings />
      </section>

      <PageActionRow>
        <Link href="/events" className={pageActionPrimaryClass}>
          <span className="truncate">Browse Gallery</span>
        </Link>
        <Link href="/register" className={pageActionSecondaryClass}>
          <span className="truncate">Start Registration</span>
        </Link>
      </PageActionRow>
    </div>
  );
}
