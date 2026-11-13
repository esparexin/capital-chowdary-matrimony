import type { Metadata } from "next";
import Link from "next/link";
import { BilingualContentTabs } from "@/components/public/BilingualContentTabs";
import {
  PageActionRow,
  pageActionPrimaryClass,
  pageActionSecondaryClass,
} from "@/components/public/PageActionRow";
import { PageIntroCard } from "@/components/public/PageIntroCard";
import { getPublishedPageWithSections } from "@/features/cms/public-pages-repo";
import { getSiteContactDetails, type SiteContactDetails } from "@/features/contact/site-contact";
import type { Locale } from "@/types/locale-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Capital Chowdary Matrimony handles website visits, WhatsApp registration messages, and family privacy.",
};

interface PrivacyPoint {
  heading: string;
  body: string;
}

function buildPrivacyPoints(locale: Locale, contact: SiteContactDetails): readonly PrivacyPoint[] {
  if (locale === "te") {
    return [
      {
        heading: "1. సమాచార వెబ్‌సైట్ మాత్రమే",
        body: "ఈ వెబ్‌సైట్ క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ సేవలు, రుసుములు మరియు సంప్రదింపు వివరాలను తెలియజేసే సమాచార పోర్టల్ మాత్రమే. పబ్లిక్ ప్రొఫైల్ శోధన లేదా ఆన్‌లైన్ ఖాతాలు ఇందులో లేవు.",
      },
      {
        heading: "2. డేటాబేస్‌లో నమోదు వివరాలు నిల్వ చేయబడవు",
        body: `నమోదు ఫారమ్ (/register) ద్వారా మీరు నమోదు చేసే వివరములు Cloudflare D1 డేటాబేస్‌లో నిల్వ చేయబడవు. "Send via WhatsApp" క్లిక్ చేసినప్పుడు మీ బ్రౌజర్ నేరుగా అధికారిక WhatsApp నంబర్ (${contact.whatsappDisplay}) కు సందేశాన్ని సిద్ధం చేస్తుంది.`,
      },
      {
        heading: "3. కస్టమర్ ఖాతాలు లేదా మూడవ పక్ష విక్రయాలు లేవు",
        body: "వెబ్‌సైట్ సందర్శకుల కొరకు వ్యక్తిగత లాగిన్ ఖాతాలు లేవు. కుటుంబ వివరములు మూడవ పక్షాలకు విక్రయించబడవు లేదా బహిర్గతం చేయబడవు.",
      },
      {
        heading: "4. Google Maps లింకులు",
        body: `నరసరావుపేట కార్యాలయ దిశల కొరకు ఇచ్చిన లింకులు నేరుగా Google Maps శోధన పేజీని తెరుస్తాయి; అదనపు ట్రాకింగ్ స్క్రిప్ట్‌లు లేదా ప్రకటన కుకీలు ఉపయోగించబడవు.`,
      },
    ];
  }

  return [
    {
      heading: "1. Informational Portal Behaviour",
      body: "This website serves strictly as an informational portal describing Capital Chowdary Matrimony services, fees, events, and Narasaraopet office contact details. There is no public profile directory or searchable member database.",
    },
    {
      heading: "2. Zero D1 Registration Storage & WhatsApp Flow",
      body: `Details entered on the registration page (/register) are not stored in our Cloudflare D1 database. Selecting "Send via WhatsApp" formats your inquiry in your browser and opens WhatsApp directly to our official number (${contact.whatsappDisplay}).`,
    },
    {
      heading: "3. No Customer Accounts or Stored Inquiry Databases",
      body: "We do not maintain public customer login accounts or automated inquiry records on this portal. Family conversations take place directly through WhatsApp, phone, email, or in-person consultation.",
    },
    {
      heading: "4. Keyless Google Maps Search Links",
      body: "Office location links open Google Maps directions in a separate tab without embedded tracking keys or third-party advertising trackers.",
    },
  ];
}

function renderPrivacyTab(locale: Locale, contact: SiteContactDetails, bodyNote: string) {
  const isTelugu = locale === "te";
  const points = buildPrivacyPoints(locale, contact);

  return (
    <div lang={locale} className="space-y-4">
      {bodyNote ? (
        <p className="rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 text-sm leading-relaxed text-[#3D272E]">
          {bodyNote}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {points.map((point) => (
          <article
            key={point.heading}
            className="rounded-xl border border-[#C5A15A]/45 bg-white p-5 shadow-xs"
          >
            <h2 className="font-serif text-lg font-semibold text-[#70243B]">{point.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#3D272E]">{point.body}</p>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5 text-sm text-[#3D272E]">
        <h2 className="font-serif text-base font-semibold text-[#70243B]">
          {isTelugu ? "గోప్యత సందేహాలకు సంప్రదించండి" : "Privacy & Office Inquiries"}
        </h2>
        <p className="mt-1.5 leading-relaxed">
          {isTelugu
            ? `${contact.addressFull} · ఫోన్: ${contact.phoneDisplay} · ఇమెయిల్: ${contact.email}`
            : `${contact.addressFull} · Phone: ${contact.phoneDisplay} · Email: ${contact.email}`}
        </p>
      </section>
    </div>
  );
}

export default async function PrivacyPage() {
  const [{ page }, contact] = await Promise.all([
    getPublishedPageWithSections("privacy"),
    getSiteContactDetails(),
  ]);

  return (
    <div className="-mt-6 space-y-6 sm:-mt-4">
      <PageIntroCard
        eyebrowTe="క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ · గోప్యతా విధానం"
        titleEn={page?.titleEn ?? "Privacy Policy"}
        titleTe={page?.titleTe ?? "గోప్యతా విధానం"}
        summaryEn={
          page?.summaryEn ??
          "Zero D1 registration storage, direct WhatsApp inquiry flow, and respect for family privacy."
        }
        summaryTe={page?.summaryTe}
      />

      <BilingualContentTabs
        englishContent={renderPrivacyTab("en", contact, page?.bodyEn ?? "")}
        teluguContent={renderPrivacyTab("te", contact, page?.bodyTe ?? "")}
      />

      <PageActionRow>
        <Link href="/contact" className={pageActionPrimaryClass}>
          <span className="truncate">Contact Office</span>
        </Link>
        <Link href="/terms-and-conditions" className={pageActionSecondaryClass}>
          <span className="truncate">View Terms &amp; Conditions</span>
        </Link>
      </PageActionRow>
    </div>
  );
}
