"use client";

import { useCallback, useState } from "react";
import { DEFAULT_LOCALE } from "@/constants/locales";
import type { Locale } from "@/types/locale-types";

/**
 * Manages client-side English / Telugu language selection state.
 */
export function useLocale(initialLocale: Locale = DEFAULT_LOCALE) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const toggleLocale = useCallback(() => {
    setLocale((current) => (current === "en" ? "te" : "en"));
  }, []);

  return {
    locale,
    setLocale,
    toggleLocale,
  };
}
