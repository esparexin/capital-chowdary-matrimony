import type { Metadata } from "next";
import Link from "next/link";
import { BilingualContentTabs } from "@/components/public/BilingualContentTabs";
import { HowItWorksInfographic } from "@/components/public/HowItWorksInfographic";
import {
  PageActionRow,
  pageActionPrimaryClass,
  pageActionSecondaryClass,
} from "@/components/public/PageActionRow";
import { PageIntroCard } from "@/components/public/PageIntroCard";
import {
  extractProcessSteps,
  getPublishedPageWithSections,
} from "@/features/cms/public-pages-repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Step-by-step matrimonial registration, proposal introduction, and independent family verification process at Capital Chowdary Matrimony.",
};

export default async function HowItWorksPage() {
  const { page, sections } = await getPublishedPageWithSections("how-it-works");
  const steps = extractProcessSteps(sections);
  const titleTe = !page?.titleTe || page.titleTe === "సేవా విధానం" ? "పని విధానం" : page.titleTe;

  return (
    <div className="-mt-6 space-y-6 sm:-mt-4">
      <PageIntroCard titleEn={page?.titleEn ?? "How It Works"} titleTe={titleTe} />

      <BilingualContentTabs
        englishContent={
          <HowItWorksInfographic
            steps={steps}
            locale="en"
            verificationNote={
              page?.bodyEn ||
              "Education, health, financial, and background checks must be independently verified by both families. The bureau does not guarantee a marriage within any fixed period."
            }
          />
        }
        teluguContent={
          <HowItWorksInfographic
            steps={steps}
            locale="te"
            verificationNote={
              page?.bodyTe ||
              "విద్య, ఆరోగ్య, ఆర్థిక మరియు కుటుంబ వివరాలను ఇరు కుటుంబాలు స్వతంత్రంగా విచారించుకోవాలి. వివాహానికి ఎటువంటి హామీ ఉండదు."
            }
          />
        }
      />

      <PageActionRow>
        <Link href="/register" className={pageActionPrimaryClass}>
          <span className="truncate">Start Registration</span>
        </Link>
        <Link href="/terms-and-conditions" className={pageActionSecondaryClass}>
          <span className="truncate">Terms and Conditions</span>
        </Link>
      </PageActionRow>
    </div>
  );
}
