import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { GooglePayIcon } from "@/components/shared/GooglePayIcon";
import { PhonePeIcon } from "@/components/shared/PhonePeIcon";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import type { SiteContactDetails } from "@/features/contact/site-contact";

interface ContactInfoCardsProps {
  contact: SiteContactDetails;
  addressVariant?: "about" | "full";
  showAddress?: boolean;
  showHelperText?: boolean;
  showTimings?: boolean;
  showPayment?: boolean;
  hideChannelsOnMobile?: boolean;
}

/**
 * Shared mobile-first contact information cards for About Us and Contact Us.
 * Every actionable channel uses accessible semantic links and >=44px tap targets.
 */
export function ContactInfoCards({
  contact,
  addressVariant = "about",
  showAddress = true,
  showHelperText = true,
  showTimings = true,
  showPayment = true,
  hideChannelsOnMobile = false,
}: ContactInfoCardsProps) {
  const displayedAddress = addressVariant === "full" ? contact.addressFull : contact.addressAbout;
  const itemAlignClass = showHelperText ? "items-start" : "items-center";
  const iconOffsetClass = showHelperText ? "mt-0.5" : "";
  const channelDisplayClass = hideChannelsOnMobile ? "hidden md:flex" : "flex";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <a
        href={contact.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`group ${channelDisplayClass} min-h-11 ${itemAlignClass} gap-3.5 rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 transition-colors hover:border-[#70243B]/50 hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2`}
      >
        <span
          className={`${iconOffsetClass} inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#128C7E]`}
        >
          <WhatsAppIcon className="size-4.5" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wide text-[#593E46]">
            WhatsApp
          </span>
          <span className="mt-1 block text-base font-semibold text-[#70243B] group-hover:underline">
            {contact.whatsappDisplay}
          </span>
          {showHelperText ? (
            <span className="mt-0.5 block text-xs text-[#593E46]">Tap to message on WhatsApp</span>
          ) : null}
        </span>
      </a>

      <a
        href={contact.phoneHref}
        className={`group ${channelDisplayClass} min-h-11 ${itemAlignClass} gap-3.5 rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 transition-colors hover:border-[#70243B]/50 hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2`}
      >
        <span
          className={`${iconOffsetClass} inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#70243B]/10 text-[#70243B]`}
        >
          <Phone className="size-4.5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wide text-[#593E46]">
            Phone
          </span>
          <span className="mt-1 block text-base font-semibold text-[#70243B] group-hover:underline">
            {contact.phoneDisplay}
          </span>
          {showHelperText ? (
            <span className="mt-0.5 block text-xs text-[#593E46]">Tap to call bureau office</span>
          ) : null}
        </span>
      </a>

      {showPayment ? (
        <a
          href={contact.paymentHref}
          className={`group flex min-h-11 ${itemAlignClass} gap-3.5 rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 transition-colors hover:border-[#70243B]/50 hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2`}
        >
          <span
            className={`${iconOffsetClass} inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg border border-[#C5A15A]/30 bg-white px-2 shadow-2xs`}
          >
            <PhonePeIcon className="size-4 text-[#5F259F]" />
            <GooglePayIcon className="size-4 text-[#4285F4]" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wide text-[#593E46]">
              PhonePe / Google Pay
            </span>
            <span className="mt-1 block text-base font-semibold text-[#70243B] group-hover:underline">
              {contact.paymentDisplay}
            </span>
            {showHelperText ? (
              <span className="mt-0.5 block text-xs text-[#593E46]">
                Official payment &amp; UPI number
              </span>
            ) : (
              <span className="mt-0.5 block text-xs font-medium text-[#593E46]">
                Payment / UPI Number
              </span>
            )}
          </span>
        </a>
      ) : null}

      <a
        href={contact.emailHref}
        className={`group ${channelDisplayClass} min-h-11 ${itemAlignClass} gap-3.5 rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 transition-colors hover:border-[#70243B]/50 hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2`}
      >
        <span
          className={`${iconOffsetClass} inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#70243B]/10 text-[#70243B]`}
        >
          <Mail className="size-4.5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wide text-[#593E46]">
            Email
          </span>
          <span className="mt-1 block break-all text-base font-semibold text-[#70243B] group-hover:underline">
            {contact.email}
          </span>
          {showHelperText ? (
            <span className="mt-0.5 block text-xs text-[#593E46]">Tap to send email</span>
          ) : null}
        </span>
      </a>

      {showAddress ? (
        <a
          href={contact.mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-11 items-start gap-3.5 rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 transition-colors hover:border-[#70243B]/50 hover:bg-[#F5EFE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-2"
        >
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#C5A15A]/20 text-[#70243B]">
            <MapPin className="size-4.5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wide text-[#593E46]">
              Office Address
            </span>
            <span className="mt-1 block text-sm font-medium leading-relaxed text-[#2F1D22] group-hover:underline sm:text-[15px]">
              {displayedAddress}
            </span>
            <span className="mt-1 block text-xs font-medium text-[#70243B]">
              Open in Google Maps &rarr;
            </span>
          </span>
        </a>
      ) : null}

      {showTimings ? (
        <div
          className={`flex items-start gap-3.5 rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 ${
            showAddress ? "sm:col-span-2 lg:col-span-1" : "sm:col-span-2 lg:col-span-1"
          }`}
        >
          <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#C5A15A]/20 text-[#70243B]">
            <Clock className="size-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#593E46]">
              Office Timings
            </p>
            <p className="mt-1 text-sm font-semibold text-[#70243B]">{contact.timings.days}</p>
            <ul className="mt-1 space-y-0.5 text-sm text-[#3D272E]">
              {contact.timings.sessions.map((session) => (
                <li key={session}>{session}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
