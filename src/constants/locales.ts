import type { Locale } from "@/types/locale-types";

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "te"] as const;

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  te: "తెలుగు",
};
