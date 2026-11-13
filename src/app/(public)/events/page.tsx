import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { BilingualContentTabs } from "@/components/public/BilingualContentTabs";
import { GalleryPhotoGrid } from "@/components/public/GalleryPhotoGrid";
import {
  PageActionRow,
  pageActionPrimaryClass,
  pageActionSecondaryClass,
} from "@/components/public/PageActionRow";
import { PageIntroCard } from "@/components/public/PageIntroCard";
import {
  getPublicEventsAndGallery,
  type PublicMarriageEvent,
  type PublicGalleryPhoto,
} from "@/features/cms/public-offerings-repo";
import { getPublishedPageWithSections } from "@/features/cms/public-pages-repo";
import type { Locale } from "@/types/locale-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery & Marriage Events",
  description:
    "Photo gallery, marriage events, Muhurtham schedules, and verified community gatherings by Capital Chowdary Matrimony.",
};

function renderCollections(
  locale: Locale,
  events: readonly PublicMarriageEvent[],
  gallery: readonly PublicGalleryPhoto[],
  bodyText: string,
) {
  const isTelugu = locale === "te";

  return (
    <div lang={locale} className="space-y-6">
      {bodyText ? (
        <p className="rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 text-sm leading-relaxed text-[#3D272E]">
          {bodyText}
        </p>
      ) : null}

      {gallery.length > 0 ? (
        <section aria-label={isTelugu ? "ఫోటో గ్యాలరీ" : "Photo Gallery"} className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#70243B]">
            {isTelugu ? "ధృవీకరించబడిన ఫోటో గ్యాలరీ" : "Verified Photo Gallery"}
          </h2>
          <GalleryPhotoGrid photos={gallery} isTelugu={isTelugu} />
        </section>
      ) : null}

      {events.length > 0 ? (
        <section aria-label={isTelugu ? "వివాహ వేడుకలు" : "Marriage Events"} className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#70243B]">
            {isTelugu ? "నిర్వహించిన మరియు రాబోయే వేడుకలు" : "Organised Marriage Events"}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {events.map((eventItem) => (
              <article
                key={eventItem.id}
                className="overflow-hidden rounded-xl border border-[#C5A15A]/45 bg-white shadow-xs"
              >
                {eventItem.coverUrl ? (
                  <div className="relative aspect-16/10 w-full bg-[#FAF8F3]">
                    <Image
                      src={eventItem.coverUrl}
                      alt={eventItem.coverAltEn || eventItem.titleEn}
                      width={eventItem.coverWidth ?? 1200}
                      height={eventItem.coverHeight ?? 750}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="space-y-2 p-5">
                  <h3 className="font-serif text-lg font-semibold text-[#70243B]">
                    {isTelugu ? eventItem.titleTe : eventItem.titleEn}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-[#593E46]">
                    {eventItem.eventDate ? (
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3.5 text-[#70243B]" aria-hidden="true" />
                        {eventItem.eventDate}
                      </span>
                    ) : null}
                    {(isTelugu ? eventItem.locationTe : eventItem.locationEn) ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5 text-[#70243B]" aria-hidden="true" />
                        {isTelugu ? eventItem.locationTe : eventItem.locationEn}
                      </span>
                    ) : null}
                  </div>
                  {(isTelugu ? eventItem.descriptionTe : eventItem.descriptionEn) ? (
                    <p className="text-sm leading-relaxed text-[#3D272E]">
                      {isTelugu ? eventItem.descriptionTe : eventItem.descriptionEn}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default async function EventsPage() {
  const [{ page }, { events, gallery }] = await Promise.all([
    getPublishedPageWithSections("events"),
    getPublicEventsAndGallery(),
  ]);

  const hasPublishedMedia = events.length > 0 || gallery.length > 0;

  return (
    <div className="-mt-6 space-y-6 pb-16 sm:-mt-4 md:pb-0">
      <PageIntroCard
        eyebrowTe="క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ · ఫోటో గ్యాలరీ"
        titleEn={page?.titleEn ?? "Gallery & Marriage Events"}
        titleTe={page?.titleTe ?? "గ్యాలరీ మరియు వివాహ వేడుకలు"}
        summaryEn={
          page?.summaryEn ??
          "Bureau-organised marriage events, Muhurtham calendar charts, and official photographs."
        }
        summaryTe={page?.summaryTe ?? "బ్యూరో నిర్వహించిన వివాహ వేడుకలు, ముహూర్తాల పట్టిక మరియు అధికారిక ఛాయాచిత్రాలు."}
      />

      {hasPublishedMedia ? (
        <BilingualContentTabs
          englishContent={renderCollections("en", events, gallery, page?.bodyEn ?? "")}
          teluguContent={renderCollections("te", events, gallery, page?.bodyTe ?? "")}
        />
      ) : (
        <section className="rounded-2xl border border-[#C5A15A]/45 bg-[#FAF8F3] p-6 text-sm text-[#3D272E]">
          <h2 className="font-serif text-xl font-semibold text-[#70243B]">
            Photo Gallery &amp; Marriage Events
          </h2>
          <p className="mt-2 leading-relaxed">
            {page?.bodyEn ||
              "Capital Chowdary Matrimony organises marriage events, Muhurtham announcements, and Kamma family introductions across Andhra Pradesh and Telangana. Verified event notices and official photographs will appear here as soon as they are published by our Narasaraopet office."}
          </p>
          <p lang="te" className="mt-2 text-xs leading-relaxed text-[#593E46]">
            {page?.bodyTe ||
              "ఆంధ్రప్రదేశ్ మరియు తెలంగాణలో కమ్మ కుటుంబాల కొరకు వివాహ వేడుకలు, ముహూర్తాల వివరములు మరియు పరిచయ కార్యక్రమాలు నిర్వహించబడును. ప్రచురించబడిన వివరములు మరియు ఫోటోలు ఇక్కడ అందుబాటులో ఉంటాయి."}
          </p>
          <PageActionRow className="mt-4" withBottomClearance={false}>
            <Link href="/contact" className={pageActionPrimaryClass}>
              <span className="truncate">Inquire About Marriage Events</span>
            </Link>
            <Link href="/register" className={pageActionSecondaryClass}>
              <span className="truncate">Register for Alliances</span>
            </Link>
          </PageActionRow>
        </section>
      )}
    </div>
  );
}
