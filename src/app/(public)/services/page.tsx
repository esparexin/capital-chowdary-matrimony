import type { Metadata } from "next";
import Link from "next/link";
import { BilingualContentTabs } from "@/components/public/BilingualContentTabs";
import {
  PageActionRow,
  pageActionPrimaryClass,
  pageActionSecondaryClass,
} from "@/components/public/PageActionRow";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import {
  getPublishedPageWithSections,
  getPublishedServices,
} from "@/features/cms/public-pages-repo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Matrimonial registration, proposal introductions, coordination, and marriage events for software employees, doctors, NRIs, business, government employees, and divorced/late marriages.",
};

const PROPOSAL_CATEGORIES = [
  { en: "Software Employees", te: "సాఫ్ట్‌వేర్ ఉద్యోగులు" },
  { en: "Doctors (MBBS & Specialists)", te: "డాక్టర్లు (ఎంబీబీఎస్ మరియు స్పెషలిస్టులు)" },
  { en: "NRI / Abroad Alliances", te: "ఎన్ఆర్ఐ / విదేశీ సంబంధాలు" },
  { en: "Business & Industrial Families", te: "వ్యాపార కుటుంబాలు" },
  { en: "Government Employees", te: "ప్రభుత్వ ఉద్యోగులు" },
  { en: "Divorced & Late Marriages", te: "విడాకులు మరియు ఆలస్య వివాహాలు" },
  { en: "Marriage Events Coordination", te: "మ్యారేజ్ ఈవెంట్స్ సమన్వయం" },
] as const;

export default async function ServicesPage() {
  const [{ page }, services] = await Promise.all([
    getPublishedPageWithSections("services"),
    getPublishedServices(),
  ]);

  const titleEn = page?.titleEn ?? "Our Services";
  const titleTe = page?.titleTe ?? "మా సేవలు";

  return (
    <div className="-mt-6 space-y-6 sm:-mt-4">
      <BilingualContentTabs
        headerEn={
          <section
            aria-labelledby="services-heading"
            className="rounded-2xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5 shadow-xs sm:p-6"
          >
            <h1
              id="services-heading"
              className="font-serif text-2xl font-semibold leading-tight tracking-tight text-[#70243B] sm:text-3xl"
            >
              {titleEn}
            </h1>
            <p lang="te" className="mixed-script-text mt-1 text-base font-medium text-[#593E46]">
              {titleTe}
            </p>
          </section>
        }
        headerTe={
          <section
            aria-labelledby="services-heading"
            className="rounded-2xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5 shadow-xs sm:p-6"
          >
            <h1
              id="services-heading"
              lang="te"
              className="mixed-script-text font-serif text-2xl font-semibold leading-tight tracking-tight text-[#70243B] sm:text-3xl"
            >
              {titleTe}
            </h1>
            <p lang="en" className="mt-1 text-base font-medium text-[#593E46]">
              {titleEn}
            </p>
          </section>
        }
        englishContent={
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((svc) => (
                <article
                  key={svc.id}
                  className="rounded-xl border border-[#C5A15A]/40 bg-white p-5 shadow-xs"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-[#70243B]/10">
                    <ServiceIcon iconName={svc.iconName} />
                  </span>
                  <h2 className="mt-3 font-serif text-xl font-semibold text-[#70243B]">
                    {svc.titleEn}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#3D272E]">
                    {svc.descriptionEn}
                  </p>
                </article>
              ))}
            </div>

            <section className="rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5">
              <h2 className="font-serif text-xl font-semibold text-[#70243B]">
                Alliances &amp; Marriage Events We Support
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PROPOSAL_CATEGORIES.map((item) => (
                  <li
                    key={item.en}
                    className="rounded-lg border border-[#C5A15A]/30 bg-white px-3.5 py-2.5 text-sm font-medium text-[#2F1D22]"
                  >
                    {item.en}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-[#593E46]">
                {page?.bodyEn ??
                  "Our role is strictly limited to proposal introductions and event coordination; families must independently verify background details."}
              </p>
            </section>
          </div>
        }
        teluguContent={
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((svc) => (
                <article
                  key={svc.id}
                  className="rounded-xl border border-[#C5A15A]/40 bg-white p-5 shadow-xs"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-[#70243B]/10">
                    <ServiceIcon iconName={svc.iconName} />
                  </span>
                  <h2 className="mt-3 font-serif text-xl font-semibold text-[#70243B]">
                    {svc.titleTe}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#3D272E]">
                    {svc.descriptionTe}
                  </p>
                </article>
              ))}
            </div>

            <section className="rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-5">
              <h2 className="font-serif text-xl font-semibold text-[#70243B]">
                మేము అందించే సంబంధాలు &amp; మ్యారేజ్ ఈవెంట్స్ విభాగాలు
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PROPOSAL_CATEGORIES.map((item) => (
                  <li
                    key={item.en}
                    className="rounded-lg border border-[#C5A15A]/30 bg-white px-3.5 py-2.5 text-sm font-medium text-[#2F1D22]"
                  >
                    {item.te}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-[#593E46]">
                {page?.bodyTe ??
                  "బ్యూరో బాధ్యత కేవలం పరిచయం చేయడం మాత్రమే; కుటుంబాలు స్వతంత్రంగా వివరాలు నిర్ధారించుకోవాలి."}
              </p>
            </section>
          </div>
        }
      />

      <PageActionRow>
        <Link href="/register" className={pageActionPrimaryClass}>
          <span className="truncate">Register via WhatsApp</span>
        </Link>
        <Link href="/pricing" className={pageActionSecondaryClass}>
          <span className="truncate">View Membership &amp; Pricing</span>
        </Link>
      </PageActionRow>
    </div>
  );
}
