import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { buildPricingPlanWhatsAppUrl } from "@/features/pricing/pricing-whatsapp";

export interface FormattedPricingPlanItem {
  id: string;
  categoryEn: string;
  categoryTe: string;
  validityMonths: number;
  registrationFeeFormatted: string;
  maleCommissionFormatted: string;
  femaleCommissionFormatted: string;
  termsEn: string;
  termsTe: string;
}

interface PricingPlanCardProps {
  plan: FormattedPricingPlanItem;
  index: number;
  total: number;
  isTelugu: boolean;
  whatsappNumber?: string | null;
}

/**
 * Displays a single membership & commission pricing category card in English or Telugu.
 * - Mobile (< 768px): Full width (100%), displays exactly one card at a time with smooth scroll snapping.
 * - Tablet & Desktop (>= 768px): Responsive grid cells (2-col on md, 4-col on xl).
 * - Interactive: Direct "Interested" CTA routing to WhatsApp with prefilled plan parameters.
 */
export function PricingPlanCard({
  plan,
  index,
  total,
  isTelugu,
  whatsappNumber,
}: PricingPlanCardProps) {
  const title = isTelugu ? plan.categoryTe : plan.categoryEn;
  const terms = isTelugu ? plan.termsTe : plan.termsEn;
  const regLabel = isTelugu
    ? `రిజిస్ట్రేషన్ ఫీజు (${plan.validityMonths} నెలలు)`
    : `Registration Fee (${plan.validityMonths} months)`;
  const groomLabel = isTelugu ? "వరుడు వైపు కమీషన్" : "Groom Side Commission";
  const brideLabel = isTelugu ? "వధువు వైపు కమీషన్" : "Bride Side Commission";
  const whatsAppUrl = buildPricingPlanWhatsAppUrl(plan, isTelugu, whatsappNumber);

  return (
    <article
      data-pricing-slide=""
      aria-label={`${index + 1} of ${total}: ${title}`}
      className="flex h-full w-full min-w-full shrink-0 snap-start flex-col justify-between rounded-xl border border-[#C5A15A]/45 bg-white p-4 shadow-2xs sm:p-5 md:w-auto md:min-w-0 md:shrink md:snap-align-none"
    >
      <div>
        <h3 className="flex min-h-[3rem] items-center font-serif text-lg font-semibold leading-snug text-[#70243B] sm:text-xl md:min-h-[3.5rem]">
          {title}
        </h3>
        <dl className="mt-3 space-y-2 border-t border-[#C5A15A]/25 pt-3 text-sm">
          <div className="flex items-baseline justify-between gap-2 border-b border-[#C5A15A]/15 pb-2">
            <dt className="text-[#593E46]">{regLabel}</dt>
            <dd className="shrink-0 text-base font-bold tabular-nums text-[#70243B]">
              {plan.registrationFeeFormatted}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2 border-b border-[#C5A15A]/15 pb-2">
            <dt className="text-[#593E46]">{groomLabel}</dt>
            <dd className="shrink-0 text-base font-bold tabular-nums text-[#2F1D22]">
              {plan.maleCommissionFormatted}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-[#593E46]">{brideLabel}</dt>
            <dd className="shrink-0 text-base font-bold tabular-nums text-[#2F1D22]">
              {plan.femaleCommissionFormatted}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-3 space-y-3">
        <p className="min-h-[3.25rem] border-t border-[#C5A15A]/15 pt-2.5 text-xs leading-relaxed text-[#593E46] md:min-h-0">
          {terms}
        </p>

        <div className="border-t border-[#C5A15A]/15 pt-2.5">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${isTelugu ? "ఆసక్తి ఉంది - వాట్సాప్ ద్వారా సంప్రదించండి" : "Interested - Inquire via WhatsApp"}: ${title}`}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#1EBE5D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="size-4 shrink-0 fill-current" />
            <span>{isTelugu ? "ఆసక్తి ఉంది" : "Interested"}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
