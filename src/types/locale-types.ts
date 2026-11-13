export type Locale = "en" | "te";

export interface LocalizedText {
  en: string;
  te: string;
}

export interface SeoMetadata {
  title: LocalizedText;
  description: LocalizedText;
  canonicalPath: string;
  noIndex?: boolean;
}
