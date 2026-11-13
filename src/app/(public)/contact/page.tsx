import type { Metadata } from "next";
import { ContactInfoCards } from "@/components/public/ContactInfoCards";
import { GoogleMapSection } from "@/components/public/GoogleMapSection";
import { getSiteContactDetails } from "@/features/contact/site-contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Capital Chowdary Matrimony in Narasaraopet via WhatsApp (+91 78420 97842), Phone (+91 78420 97842), Email, or visit Ravipadu Road, Narasaraopet – 522601.",
};

export default async function ContactPage() {
  const contact = await getSiteContactDetails();

  return (
    <div className="-mt-6 space-y-6 pb-4 sm:-mt-4 md:pb-0">
      <section
        aria-labelledby="contact-heading"
        className="rounded-2xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5 shadow-xs sm:p-6"
      >
        <p lang="te" className="mixed-script-text text-sm font-semibold text-[#70243B]">
          {contact.businessNameTe} &middot; {contact.mottoTe}
        </p>
        <h1
          id="contact-heading"
          className="mt-1.5 font-serif text-2xl font-semibold leading-tight tracking-tight text-[#70243B] sm:text-3xl"
        >
          Contact Us
        </h1>
      </section>

      <section aria-labelledby="contact-channels-heading" className="space-y-3">
        <h2
          id="contact-channels-heading"
          className="font-serif text-xl font-semibold text-[#70243B] sm:text-2xl"
        >
          Contact Details
        </h2>
        <ContactInfoCards
          contact={contact}
          addressVariant="full"
          showAddress={false}
          showHelperText={false}
          showTimings
          hideChannelsOnMobile
        />
      </section>

      <GoogleMapSection contact={contact} />
    </div>
  );
}
