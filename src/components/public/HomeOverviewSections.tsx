import Link from "next/link";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import type { SiteContactDetails } from "@/features/contact/site-contact";
import type { Service } from "@/types/database-types";

interface HomeOverviewSectionsProps {
  services: ReadonlyArray<
    Pick<Service, "id" | "titleEn" | "titleTe" | "descriptionEn" | "iconName">
  >;
  contact: SiteContactDetails;
}

/**
 * Compact overview sections below the Homepage Hero: Services overview, Contact summary, and
 * Registration CTA.
 */
export function HomeOverviewSections({ services, contact }: HomeOverviewSectionsProps) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="home-services-heading" className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="home-services-heading"
              className="font-serif text-xl font-semibold text-[#70243B] sm:text-2xl"
            >
              Our Matrimonial &amp; Event Services
            </h2>
            <p className="text-sm text-[#593E46]">
              Dedicated introduction support across Andhra Pradesh and Telangana
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-[#70243B] underline-offset-4 hover:underline"
          >
            Explore all services &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex h-full min-w-0 flex-col rounded-xl border border-[#C5A15A]/35 bg-[#FAF8F3] p-3 shadow-2xs sm:p-4"
            >
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#70243B]/10 sm:size-9">
                <ServiceIcon
                  iconName={service.iconName}
                  className="size-4 text-[#70243B] sm:size-5"
                />
              </span>
              <h3 className="mt-2.5 break-words font-serif text-[0.9375rem] font-semibold leading-snug text-[#70243B] sm:mt-3 sm:text-lg">
                {service.titleEn}
              </h3>
              <p
                lang="te"
                className="mixed-script-text mt-1 break-words text-[0.6875rem] font-medium leading-snug text-[#593E46] sm:mt-0.5 sm:text-xs"
              >
                {service.titleTe}
              </p>
              <p className="mt-1.5 break-words text-xs leading-snug text-[#3D272E] sm:mt-2 sm:text-sm sm:leading-relaxed">
                {service.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="home-contact-cta-heading"
        className="hidden rounded-2xl border border-[#70243B]/20 bg-[#70243B] p-5 text-[#FAF8F3] shadow-xs sm:p-7 md:block"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
          <div className="space-y-2 lg:col-span-8">
            <h2
              id="home-contact-cta-heading"
              className="font-serif text-xl font-semibold sm:text-2xl"
            >
              Begin Your Family Registration or Visit Our Office
            </h2>
            <p className="text-sm leading-relaxed text-[#FAF8F3]/90">
              {contact.addressAbout} Open {contact.timings.days} (
              {contact.timings.sessions.join(", ")}). Call {contact.phoneDisplay} or WhatsApp{" "}
              {contact.whatsappDisplay}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#C5A15A] px-5 py-2.5 text-sm font-semibold text-[#2B151B] shadow-xs transition-colors hover:bg-[#d1b06c]"
            >
              Register via WhatsApp
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#FAF8F3]/40 px-5 py-2.5 text-sm font-semibold text-[#FAF8F3] transition-colors hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
