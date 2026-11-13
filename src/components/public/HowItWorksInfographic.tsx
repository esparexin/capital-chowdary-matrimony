import {
  ClipboardCheck,
  FileText,
  Handshake,
  Phone,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ProcessStepItem } from "@/features/cms/public-pages-repo";
import type { Locale } from "@/types/locale-types";

const STEP_ICON_MAP: Record<number, LucideIcon> = {
  1: Phone,
  2: ClipboardCheck,
  3: FileText,
  4: Users,
  5: ShieldCheck,
  6: Handshake,
};

interface HowItWorksInfographicProps {
  steps: readonly ProcessStepItem[];
  locale: Locale;
  verificationNote: string;
}

/**
 * Connected responsive 6-step process infographic:
 * vertical gold-spine timeline on mobile and connected multi-column / 6-step horizontal flow on tablet & desktop.
 */
export function HowItWorksInfographic({
  steps,
  locale,
  verificationNote,
}: HowItWorksInfographicProps) {
  const isTelugu = locale === "te";

  return (
    <div lang={locale} className="space-y-5">
      <div className="rounded-2xl border border-[#C5A15A]/45 bg-[#FAF8F3] px-4 py-5 shadow-xs sm:px-6 sm:py-7 lg:px-7">
        <ol
          role="list"
          className="relative grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-x-4 md:gap-y-8 lg:grid-cols-6 lg:gap-x-3"
        >
          {steps.map((item, index) => {
            const StepIcon = STEP_ICON_MAP[item.step] ?? Handshake;
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;
            const showLeftConnector = !isFirst;
            const hideLeftAtTabletRowStart = index === 3 ? "md:opacity-0 lg:opacity-100" : "";
            const hideRightAtTabletRowEnd = index === 2 ? "md:opacity-0 lg:opacity-100" : "";
            const stepText = isTelugu ? item.te : item.en;

            return (
              <li
                key={item.step}
                className="group relative flex items-start gap-3.5 md:flex-col md:items-center md:gap-0 md:text-center"
              >
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-9 -bottom-5 left-[17px] w-0.5 bg-[#C5A15A]/65 md:hidden"
                  />
                ) : null}

                <div className="relative flex shrink-0 items-center justify-center md:w-full">
                  <span
                    aria-hidden="true"
                    className={`hidden h-0.5 flex-1 md:block ${
                      showLeftConnector ? "bg-[#C5A15A]/65" : "bg-transparent"
                    } ${hideLeftAtTabletRowStart}`}
                  />

                  <span className="relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#70243B] font-serif text-sm font-semibold text-[#FAF8F3] ring-4 ring-[#FAF8F3] transition-transform duration-200 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:size-10 md:text-base">
                    {item.step}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`hidden h-0.5 flex-1 md:block ${
                      !isLast ? "bg-[#C5A15A]/65" : "bg-transparent"
                    } ${hideRightAtTabletRowEnd}`}
                  />
                </div>

                <div className="flex min-w-0 flex-1 items-start gap-2.5 pt-0.5 md:mt-3.5 md:w-full md:flex-col md:items-center md:gap-2.5 md:px-1 md:pt-0">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[#C5A15A]/55 bg-white text-[#70243B] shadow-2xs md:size-9">
                    <StepIcon className="size-4 md:size-[18px]" aria-hidden="true" />
                  </span>

                  <p className="min-w-0 text-[15px] font-medium leading-relaxed text-[#2F1D22] break-words md:text-sm">
                    {stepText}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="rounded-xl border border-[#C5A15A]/40 bg-[#FAF8F3] px-4 py-3.5 text-sm text-[#3D272E] sm:px-5">
        <p className="font-semibold text-[#70243B]">
          {isTelugu
            ? "పరిచయం మా వంతు – పరిశీలన మీ వంతు."
            : "Introduction is our part — Verification is yours."}
        </p>
        <p className="mt-1 leading-relaxed">{verificationNote}</p>
      </div>
    </div>
  );
}
