import type { Metadata } from "next";
import Link from "next/link";
import { BilingualContentTabs } from "@/components/public/BilingualContentTabs";
import {
  PageActionRow,
  pageActionPrimaryClass,
  pageActionSecondaryClass,
} from "@/components/public/PageActionRow";
import { PageIntroCard } from "@/components/public/PageIntroCard";
import { extractTermsLists, getPublishedPageWithSections } from "@/features/cms/public-pages-repo";
import type { Locale } from "@/types/locale-types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Membership terms, 11-month non-refundable fee rules, two-instalment commission policy, and family verification conditions.",
};

function renderTermsLocaleView(
  locale: Locale,
  conditions: readonly string[],
  acceptance: readonly string[],
  bodyNote: string,
) {
  const isTelugu = locale === "te";

  return (
    <div lang={locale} className="space-y-5">
      {bodyNote ? (
        <p className="rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 text-sm leading-relaxed text-[#3D272E]">
          {bodyNote}
        </p>
      ) : null}

      <section className="rounded-2xl border border-[#C5A15A]/45 bg-white p-5 shadow-xs sm:p-6">
        <h2 className="font-serif text-xl font-semibold text-[#70243B]">
          {isTelugu ? "నియమాలు మరియు షరతులు" : "Bureau Terms & Conditions"}
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-sm leading-relaxed text-[#2F1D22]">
          {conditions.map((rule) => (
            <li key={rule} className="pl-1">
              {rule}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-[#C5A15A]/45 bg-[#FAF8F3] p-5 sm:p-6">
        <h2 className="font-serif text-lg font-semibold text-[#70243B]">
          {isTelugu ? "దరఖాస్తుదారు అంగీకార ప్రకటన" : "Applicant Acceptance Declaration"}
        </h2>
        <ul className="mt-3 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-[#3D272E]">
          {acceptance.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default async function TermsAndConditionsPage() {
  const { page, sections } = await getPublishedPageWithSections("terms-and-conditions");
  const { conditionsEn, conditionsTe, acceptanceEn, acceptanceTe } = extractTermsLists(sections);

  return (
    <div className="-mt-6 space-y-6 sm:-mt-4">
      <PageIntroCard
        eyebrowTe="క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ · నియమాలు మరియు షరతులు"
        titleEn={page?.titleEn ?? "Terms & Conditions"}
        titleTe={page?.titleTe ?? "నియమాలు మరియు షరతులు"}
        summaryEn={
          page?.summaryEn ??
          "Official membership rules, fee validity, commission schedule, and independent family verification obligations."
        }
        summaryTe={page?.summaryTe}
      />

      <BilingualContentTabs
        initialLocale="te"
        englishContent={renderTermsLocaleView("en", conditionsEn, acceptanceEn, page?.bodyEn ?? "")}
        teluguContent={renderTermsLocaleView("te", conditionsTe, acceptanceTe, page?.bodyTe ?? "")}
      />

      <PageActionRow>
        <Link href="/register" className={pageActionPrimaryClass}>
          <span className="truncate">Proceed to Registration</span>
        </Link>
        <Link href="/pricing" className={pageActionSecondaryClass}>
          <span className="truncate">Membership &amp; Fee Details</span>
        </Link>
      </PageActionRow>
    </div>
  );
}
