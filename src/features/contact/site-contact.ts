import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { siteSettings } from "@/db/schema";

export interface OfficeTimingsInfo {
  days: string;
  sessions: readonly string[];
}

export interface AssociationInfo {
  name: string;
  registrationNumber: string;
}

export interface SiteContactDetails {
  businessNameEn: string;
  businessNameTe: string;
  mottoTe: string;
  founderName: string;
  serviceArea: string;
  whatsappDisplay: string;
  whatsappShortDisplay: string;
  whatsappHref: string;
  phoneDisplay: string;
  phoneShortDisplay: string;
  phoneHref: string;
  paymentDisplay: string;
  paymentShortDisplay: string;
  paymentHref: string;
  email: string;
  emailHref: string;
  addressShort: string;
  addressAbout: string;
  addressFull: string;
  mapsSearchUrl: string;
  mapsEmbedUrl: string;
  timings: OfficeTimingsInfo;
  association: AssociationInfo;
}

export const VERIFIED_CONTACT_WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=917842097842&text=Namaste%2C+I+want+to+register+in+Capital+Chowdary+Matrimony&type=phone_number&app_absent=0";
export const VERIFIED_MAPS_SEARCH_URL =
  "https://www.google.com/maps/search/?api=1&query=Ravipadu%20Road%20Narasaraopet%20522601";
export const VERIFIED_MAPS_EMBED_URL =
  "https://maps.google.com/maps?q=Ravipadu%20Road%20Narasaraopet%20522601&output=embed";

export const VERIFIED_CONTACT_DEFAULTS: SiteContactDetails = {
  businessNameEn: "Capital Chowdary Matrimony",
  businessNameTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ",
  mottoTe: "పరిచయం మా వంతు విచారణ మీ వంతు",
  founderName: "Indlamuri Ramesh Babu",
  serviceArea: "Serving Andhra Pradesh & Telangana.",
  whatsappDisplay: "+91 78420 97842",
  whatsappShortDisplay: "78420 97842",
  whatsappHref: VERIFIED_CONTACT_WHATSAPP_URL,
  phoneDisplay: "+91 78420 97842",
  phoneShortDisplay: "78420 97842",
  phoneHref: "tel:+917842097842",
  paymentDisplay: "+91 95426 86789",
  paymentShortDisplay: "95426 86789",
  paymentHref: "tel:+919542686789",
  email: "capitalmatrimony@gmail.com",
  emailHref: "mailto:capitalmatrimony@gmail.com",
  addressShort: "11-31-64/1, Ravipadu Road, Narasaraopet – 522601",
  addressAbout: "Door No. 11-31-64/1, Ravipadu Road, Opp. Old TVS Showroom, Narasaraopet – 522601.",
  addressFull:
    "Door No. 11-31-64/1, Ravipadu Road, Opp. Old TVS Showroom, Narasaraopet – 522601, Andhra Pradesh, India.",
  mapsSearchUrl: VERIFIED_MAPS_SEARCH_URL,
  mapsEmbedUrl: VERIFIED_MAPS_EMBED_URL,
  timings: {
    days: "Monday – Saturday",
    sessions: ["10:00 AM – 1:00 PM", "3:00 PM – 6:00 PM"],
  },
  association: {
    name: "Kamma Welfare Association, Andhra & Telangana",
    registrationNumber: "AP-07 91-058-0756579",
  },
};

const PLACEHOLDER_DIGITS = new Set(["919000000000", "0000000000"]);

interface SiteSettingsContactRecord {
  businessNameEn?: string | null;
  businessNameTe?: string | null;
  addressEn?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  contactEmail?: string | null;
  mapUrl?: string | null;
  isContactVerified?: boolean | null;
}

function normalizePhoneDigits(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length < 8 || digits.length > 15 || PLACEHOLDER_DIGITS.has(digits) ? null : digits;
}

function formatCompactIndianNumber(displayValue: string): string {
  return displayValue.replace(/^\+91\s*/, "").trim();
}

/**
 * Derives a keyless, privacy-conscious Google Maps embed URL from a search URL.
 */
export function buildGoogleMapsEmbedUrl(mapUrl?: string | null): string {
  if (!mapUrl) return VERIFIED_MAPS_EMBED_URL;
  try {
    const parsed = new URL(mapUrl);
    const isGoogle = ["www.google.com", "google.com", "maps.google.com"].includes(parsed.hostname);
    const query = parsed.searchParams.get("query") ?? parsed.searchParams.get("q");
    if (!isGoogle || !query?.trim()) return VERIFIED_MAPS_EMBED_URL;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&output=embed`;
  } catch {
    return VERIFIED_MAPS_EMBED_URL;
  }
}

/**
 * Builds the direct WhatsApp contact link with the verified pre-filled inquiry message.
 */
export function buildContactWhatsAppUrl(
  phoneDigits = "917842097842",
  prefilledMessage = "Namaste, I want to register in Capital Chowdary Matrimony",
): string {
  const digits = phoneDigits.replace(/\D/g, "");
  if (!digits) return VERIFIED_CONTACT_WHATSAPP_URL;
  const params = new URLSearchParams({
    phone: digits,
    text: prefilledMessage,
    type: "phone_number",
    app_absent: "0",
  });
  return `https://api.whatsapp.com/send/?${params.toString()}`;
}

/**
 * Resolves contact details from D1 `site_settings` (when verified) with verified owner defaults.
 */
export function resolveSiteContactDetails(
  settings?: SiteSettingsContactRecord | null,
): SiteContactDetails {
  if (!settings || !settings.isContactVerified) {
    return VERIFIED_CONTACT_DEFAULTS;
  }

  const businessNameEn =
    settings.businessNameEn?.trim() || VERIFIED_CONTACT_DEFAULTS.businessNameEn;
  const businessNameTe =
    settings.businessNameTe?.trim() || VERIFIED_CONTACT_DEFAULTS.businessNameTe;

  const waDigits = normalizePhoneDigits(settings.whatsappNumber);
  const whatsappDisplay =
    waDigits && settings.whatsappNumber?.trim()
      ? settings.whatsappNumber.trim()
      : VERIFIED_CONTACT_DEFAULTS.whatsappDisplay;
  const whatsappHref = waDigits
    ? buildContactWhatsAppUrl(waDigits)
    : VERIFIED_CONTACT_DEFAULTS.whatsappHref;

  const phoneDigits = normalizePhoneDigits(settings.phoneNumber);
  const phoneDisplay =
    phoneDigits && settings.phoneNumber?.trim()
      ? settings.phoneNumber.trim()
      : VERIFIED_CONTACT_DEFAULTS.phoneDisplay;
  const phonePrefix = settings.phoneNumber?.trim().startsWith("+") ? "+" : "";
  const phoneHref = phoneDigits
    ? `tel:${phonePrefix}${phoneDigits}`
    : VERIFIED_CONTACT_DEFAULTS.phoneHref;

  const rawEmail = settings.contactEmail?.trim();
  const email = rawEmail && rawEmail.includes("@") ? rawEmail : VERIFIED_CONTACT_DEFAULTS.email;
  const emailHref = `mailto:${email}`;

  const rawAddress = settings.addressEn?.trim();
  const isDefaultAddress = !rawAddress || rawAddress === VERIFIED_CONTACT_DEFAULTS.addressFull;
  const addressFull = isDefaultAddress ? VERIFIED_CONTACT_DEFAULTS.addressFull : rawAddress;
  const addressAbout = isDefaultAddress ? VERIFIED_CONTACT_DEFAULTS.addressAbout : rawAddress;
  const addressShort = isDefaultAddress ? VERIFIED_CONTACT_DEFAULTS.addressShort : rawAddress;

  const mapsSearchUrl = settings.mapUrl?.trim().startsWith("https://")
    ? settings.mapUrl.trim()
    : VERIFIED_CONTACT_DEFAULTS.mapsSearchUrl;
  const mapsEmbedUrl = buildGoogleMapsEmbedUrl(mapsSearchUrl);

  return {
    ...VERIFIED_CONTACT_DEFAULTS,
    businessNameEn,
    businessNameTe,
    whatsappDisplay,
    whatsappShortDisplay: formatCompactIndianNumber(whatsappDisplay),
    whatsappHref,
    phoneDisplay,
    phoneShortDisplay: formatCompactIndianNumber(phoneDisplay),
    phoneHref,
    paymentDisplay: VERIFIED_CONTACT_DEFAULTS.paymentDisplay,
    paymentShortDisplay: VERIFIED_CONTACT_DEFAULTS.paymentShortDisplay,
    paymentHref: VERIFIED_CONTACT_DEFAULTS.paymentHref,
    email,
    emailHref,
    addressShort,
    addressAbout,
    addressFull,
    mapsSearchUrl,
    mapsEmbedUrl,
  };
}

/**
 * Loads verified `site_settings` contact info from D1 with clean fallback.
 */
export async function getSiteContactDetails(): Promise<SiteContactDetails> {
  try {
    const db = await getDatabase();
    const rows = await db
      .select({
        businessNameEn: siteSettings.businessNameEn,
        businessNameTe: siteSettings.businessNameTe,
        addressEn: siteSettings.addressEn,
        phoneNumber: siteSettings.phoneNumber,
        whatsappNumber: siteSettings.whatsappNumber,
        contactEmail: siteSettings.contactEmail,
        mapUrl: siteSettings.mapUrl,
        isContactVerified: siteSettings.isContactVerified,
      })
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    return resolveSiteContactDetails(rows[0] ?? null);
  } catch {
    return VERIFIED_CONTACT_DEFAULTS;
  }
}
