"use client";

import type { ReactNode } from "react";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/constants/locales";
import { useLocale } from "@/hooks/useLocale";
import type { Locale } from "@/types/locale-types";

interface BilingualContentTabsProps {
  initialLocale?: Locale;
  headerEn?: ReactNode;
  headerTe?: ReactNode;
  englishContent: ReactNode;
  teluguContent: ReactNode;
}

/**
 * Accessible bilingual tab switcher allowing visitors to toggle between English and Telugu views
 * while keeping both language panels searchable via `hidden="until-found"` semantics.
 */
export function BilingualContentTabs({
  initialLocale = "en",
  headerEn,
  headerTe,
  englishContent,
  teluguContent,
}: BilingualContentTabsProps) {
  const { locale, setLocale } = useLocale(initialLocale);
  const activeHeader = locale === "te" ? (headerTe ?? headerEn) : (headerEn ?? headerTe);

  return (
    <div className="space-y-4">
      {activeHeader ? <div className="mb-6">{activeHeader}</div> : null}

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

      <div
        role="tabpanel"
        aria-labelledby="lang-tab-en"
        tabIndex={locale === "en" ? 0 : undefined}
        hidden={locale === "en" ? undefined : ("until-found" as unknown as boolean)}
      >
        <div>{englishContent}</div>
      </div>

      <div
        role="tabpanel"
        aria-labelledby="lang-tab-te"
        lang="te"
        tabIndex={locale === "te" ? 0 : undefined}
        hidden={locale === "te" ? undefined : ("until-found" as unknown as boolean)}
        className="mixed-script-text"
      >
        <div>{teluguContent}</div>
      </div>
    </div>
  );
}
