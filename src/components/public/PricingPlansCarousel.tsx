"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  PricingPlanCard,
  type FormattedPricingPlanItem,
} from "@/components/public/PricingPlanCard";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/constants/locales";
import { useLocale } from "@/hooks/useLocale";

export type { FormattedPricingPlanItem };

interface PricingPlansCarouselProps {
  plans: readonly FormattedPricingPlanItem[];
  whatsappNumber?: string | null;
}

/**
 * Responsive bilingual membership pricing display:
 * - Mobile (< 768px): Native touch-swipeable single-card carousel with CSS scroll snap,
 *   exact 100% card width, and interactive dot indicators. Natural vertical scrolling.
 * - Tablet & Desktop (>= 768px): Responsive 2-column / 4-column grid.
 */
export function PricingPlansCarousel({ plans, whatsappNumber }: PricingPlansCarouselProps) {
  const headingId = useId();
  const { locale, setLocale } = useLocale("en");
  const isTelugu = locale === "te";

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const calculateStep = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (!firstCard) return 0;
    const secondCard = firstCard.nextElementSibling as HTMLElement | null;
    if (secondCard) {
      return secondCard.offsetLeft - firstCard.offsetLeft;
    }
    return firstCard.offsetWidth;
  }, []);

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || window.innerWidth >= 768 || plans.length <= 1) return;
    const step = calculateStep();
    if (step <= 0) return;
    const nextIdx = Math.min(plans.length - 1, Math.max(0, Math.round(el.scrollLeft / step)));
    setActiveIndex(nextIdx);
  }, [calculateStep, plans.length]);

  const scrollToPlan = useCallback(
    (idx: number) => {
      const el = trackRef.current;
      if (!el) return;
      const step = calculateStep();
      if (step <= 0) return;
      el.scrollTo({
        left: idx * step,
        behavior: "smooth",
      });
      setActiveIndex(idx);
    },
    [calculateStep],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setActiveIndex(0);
      } else {
        handleScroll();
      }
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [handleScroll]);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div
        role="tablist"
        aria-label="Language selection"
        className="inline-flex rounded-lg border border-[#C5A15A]/45 bg-[#FAF8F3] p-1"
      >
        {SUPPORTED_LOCALES.map((code) => {
          const isSelected = locale === code;
          return (
            <button
              key={code}
              id={`lang-tab-${code}`}
              type="button"
              role="tab"
              lang={code}
              aria-selected={isSelected}
              onClick={() => setLocale(code)}
              className={
                isSelected
                  ? "relative min-h-9 rounded-md border-b-2 border-[#70243B] bg-white px-4 py-1.5 text-sm font-semibold text-[#70243B] shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
                  : "relative min-h-9 rounded-md px-4 py-1.5 text-sm font-medium text-[#593E46] hover:text-[#70243B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
              }
            >
              {LOCALE_LABELS[code]}
            </button>
          );
        })}
      </div>

      <section lang={locale} aria-labelledby={headingId} className="space-y-3 sm:space-y-4">
        <h2 id={headingId} className="sr-only">
          {isTelugu ? "సభ్యత్వ విభాగాలు మరియు ఫీజు పట్టిక" : "Membership pricing categories"}
        </h2>

        <div className="relative w-full max-w-full">
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="pricing-carousel-track flex w-full max-w-full gap-4 overflow-x-auto snap-x snap-mandatory py-1 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:p-0 xl:grid-cols-4"
          >
            {plans.map((plan, idx) => (
              <PricingPlanCard
                key={plan.id}
                plan={plan}
                index={idx}
                total={plans.length}
                isTelugu={isTelugu}
                whatsappNumber={whatsappNumber}
              />
            ))}
          </div>

          {plans.length > 1 ? (
            <div
              className="mt-2.5 flex items-center justify-center gap-2 md:hidden"
              aria-label={`Plan ${activeIndex + 1} of ${plans.length}`}
            >
              {plans.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => scrollToPlan(idx)}
                  aria-label={`View ${isTelugu ? p.categoryTe : p.categoryEn}`}
                  className={`h-1.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B] ${
                    idx === activeIndex
                      ? "w-6 bg-[#70243B]"
                      : "w-2 bg-[#C5A15A]/45 hover:bg-[#C5A15A]"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <p className="hidden rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] p-4 text-xs leading-relaxed text-[#3D272E] md:block">
          {isTelugu
            ? "రిజిస్ట్రేషన్ ఫీజు వాపస్ ఇవ్వబడదు మరియు 11 నెలల వరకు వర్తిస్తుంది. కమీషన్ నిశ్చితార్థానికి 5 రోజుల ముందు 50% మరియు వివాహానికి 5 రోజుల ముందు 50% చెల్లించాలి."
            : "Registration fee is non-refundable and valid for 11 months. Marriage commission is payable in two instalments: 50% five days before engagement and 50% five days before marriage."}
        </p>
      </section>
    </div>
  );
}
