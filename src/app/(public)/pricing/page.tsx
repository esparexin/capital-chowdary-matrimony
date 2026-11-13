import type { Metadata } from "next";
import Link from "next/link";
import {
  PageActionRow,
  pageActionPrimaryClass,
  pageActionSecondaryClass,
} from "@/components/public/PageActionRow";
import { PageIntroCard } from "@/components/public/PageIntroCard";
import {
  PricingPlansCarousel,
  type FormattedPricingPlanItem,
} from "@/components/public/PricingPlansCarousel";
import { formatInrAmount, getPublicPricingPlans } from "@/features/cms/public-offerings-repo";
import { getPublishedPageWithSections } from "@/features/cms/public-pages-repo";
import { getSiteContactDetails } from "@/features/contact/site-contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Membership & Pricing",
  description:
    "Category-wise registration fees, 11-month validity, and two-instalment commission terms at Capital Chowdary Matrimony.",
};

export default async function PricingPage() {
  const [{ page }, pricingResult, contact] = await Promise.all([
    getPublishedPageWithSections("pricing"),
    getPublicPricingPlans(),
    getSiteContactDetails(),
  ]);

  const formattedPlans: FormattedPricingPlanItem[] = pricingResult.plans.map((plan) => ({
    id: plan.id,
    categoryEn: plan.categoryEn,
    categoryTe: plan.categoryTe,
    validityMonths: plan.validityMonths,
    registrationFeeFormatted: formatInrAmount(plan.registrationFeeInr),
    maleCommissionFormatted: formatInrAmount(plan.maleCommissionInr),
    femaleCommissionFormatted: formatInrAmount(plan.femaleCommissionInr),
    termsEn: plan.termsEn,
    termsTe: plan.termsTe,
  }));

  return (
    <div className="-mt-6 space-y-4 sm:-mt-4 sm:space-y-6">
      <PageIntroCard
        eyebrowTe="క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ · సభ్యత్వ వివరాలు"
        titleEn="Membership & Pricing"
        titleTe={page?.titleTe ?? "సభ్యత్వం మరియు ఫీజు వివరములు"}
      />

      {formattedPlans.length === 0 ? (
        <section className="rounded-2xl border border-[#C5A15A]/45 bg-[#FAF8F3] p-6 text-sm text-[#3D272E]">
          <h2 className="font-serif text-xl font-semibold text-[#70243B]">
            Fee Schedule Pending Review
          </h2>
          <p className="mt-2 leading-relaxed">
            Membership and fee schedules are currently being updated in Site Administration. Please
            contact our Narasaraopet office directly for current category details.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#70243B] px-5 py-2.5 text-sm font-semibold text-[#FAF8F3] hover:bg-[#5B1C2F]"
          >
            Contact Office
          </Link>
        </section>
      ) : (
        <PricingPlansCarousel plans={formattedPlans} whatsappNumber={contact.whatsappDisplay} />
      )}

      <PageActionRow>
        <Link href="/register" className={pageActionPrimaryClass}>
          <span className="truncate">Proceed to Registration</span>
        </Link>
        <Link href="/terms-and-conditions" className={pageActionSecondaryClass}>
          <span className="truncate">View Terms &amp; Conditions</span>
        </Link>
      </PageActionRow>
    </div>
  );
}
