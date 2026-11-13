import { ExternalLink, MapPin } from "lucide-react";
import type { SiteContactDetails } from "@/features/contact/site-contact";

interface GoogleMapSectionProps {
  contact: SiteContactDetails;
}

/**
 * Privacy-conscious, keyless Google Maps embed paired with the complete office address
 * and an explicit Get Directions link.
 */
export function GoogleMapSection({ contact }: GoogleMapSectionProps) {
  return (
    <section
      aria-labelledby="office-map-heading"
      className="rounded-2xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 shadow-xs sm:p-6"
    >
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2
          id="office-map-heading"
          className="font-serif text-xl font-semibold text-[#70243B] sm:text-2xl"
        >
          Office Location &amp; Map
        </h2>
        <p className="text-xs text-[#593E46]">Narasaraopet, Palnadu District, Andhra Pradesh</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
        <div className="overflow-hidden rounded-xl border border-[#C5A15A]/45 bg-[#F3ECE0] lg:col-span-7">
          <iframe
            src={contact.mapsEmbedUrl}
            title="Google Map showing Ravipadu Road, Narasaraopet 522601 office area"
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow=""
            className="block h-[260px] w-full border-0 sm:h-[320px] lg:h-[360px]"
          />
        </div>

        <div className="flex flex-col justify-center gap-5 rounded-xl border border-[#C5A15A]/35 bg-white p-5 sm:p-6 lg:col-span-5">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4.5 shrink-0 text-[#70243B]" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#593E46]">
                Bureau Office Address
              </p>
              <p className="text-sm font-medium leading-relaxed text-[#2F1D22] sm:text-[15px]">
                {contact.addressFull}
              </p>
            </div>
          </div>

          <a
            href={contact.mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#70243B] px-4 py-2.5 text-sm font-semibold text-[#FAF8F3] shadow-xs transition-colors hover:bg-[#5B1C2F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2"
          >
            <span>Get Directions</span>
            <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
