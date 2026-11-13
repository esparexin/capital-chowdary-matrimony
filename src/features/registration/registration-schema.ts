import { z } from "zod";

export const PROFILE_TYPES = ["Bride", "Groom"] as const;
export type RegistrationProfileType = (typeof PROFILE_TYPES)[number];
export const REGISTRATION_FORM_ID = "registration-whatsapp-form";
export const REGISTRATION_SUBMIT_STATE_EVENT = "ccm:registration-submitting";

export const FULL_NAME_MAX_LENGTH = 60;
export const MOBILE_INPUT_MAX_LENGTH = 18;
export const CITY_INPUT_MAX_LENGTH = 60;
export const EMAIL_MAX_LENGTH = 120;

const REPEATED_SYMBOL_PATTERN = /[-+().,']{2,}/;
const HTML_TAG_PATTERN = /[<>]/;
const URL_LIKE_PATTERN = /(https?:\/\/|www\.)/i;
const DOMAIN_LIKE_PATTERN = /\b[a-z0-9-]+\.(com|in|org|net|io|co|info|biz|xyz|top|online)\b/i;

/**
 * Collapses leading, trailing, and repeated internal whitespace into single spaces.
 */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Extracts digit characters only from a phone number string.
 */
export function extractPhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validates Indian 10-digit mobile numbers (`[6-9]\d{9}`, with optional `+91`/`91`)
 * and strict `+`-prefixed international E.164 numbers (`8–15` digits, no letters/repeated symbols).
 */
export function isValidRegistrationPhone(raw: string): boolean {
  const cleaned = normalizeWhitespace(raw);
  if (!cleaned || cleaned.length > MOBILE_INPUT_MAX_LENGTH) {
    return false;
  }
  if (!/^[+\d\s()-]+$/.test(cleaned)) {
    return false;
  }
  if (cleaned.indexOf("+", 1) !== -1 || REPEATED_SYMBOL_PATTERN.test(cleaned)) {
    return false;
  }

  const digits = extractPhoneDigits(cleaned);
  if (cleaned.startsWith("+")) {
    const compact = cleaned.replace(/[\s()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(compact)) {
      return false;
    }
    if (compact.startsWith("+91")) {
      return /^\+91[6-9]\d{9}$/.test(compact);
    }
    return true;
  }

  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return /^91[6-9]\d{9}$/.test(digits);
  }
  return false;
}

/**
 * Formats a validated registration mobile number consistently before WhatsApp output.
 */
export function normalizeMobileNumber(raw: string): string {
  const cleaned = normalizeWhitespace(raw);
  const digits = extractPhoneDigits(cleaned);

  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && /^91[6-9]\d{9}$/.test(digits)) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (cleaned.startsWith("+")) {
    return `+${digits}`;
  }
  return cleaned;
}

/**
 * Validates candidate full names while supporting English and Indic scripts without spam/HTML.
 */
export function isValidFullName(raw: string): boolean {
  const cleaned = normalizeWhitespace(raw);
  if (cleaned.length < 2 || cleaned.length > FULL_NAME_MAX_LENGTH) {
    return false;
  }
  if (HTML_TAG_PATTERN.test(cleaned) || URL_LIKE_PATTERN.test(cleaned)) {
    return false;
  }
  if (REPEATED_SYMBOL_PATTERN.test(cleaned)) {
    return false;
  }
  const letters = cleaned.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) {
    return false;
  }
  return /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*[\p{L}\p{M}.]$/u.test(cleaned);
}

/**
 * Validates city or town names: rejects numeric-only, HTML, URLs, domains, and symbol spam
 * while permitting legitimate multi-word Indian towns and cities.
 */
export function isValidCityName(raw: string): boolean {
  const cleaned = normalizeWhitespace(raw);
  if (cleaned.length < 2 || cleaned.length > CITY_INPUT_MAX_LENGTH) {
    return false;
  }
  if (
    HTML_TAG_PATTERN.test(cleaned) ||
    URL_LIKE_PATTERN.test(cleaned) ||
    DOMAIN_LIKE_PATTERN.test(cleaned)
  ) {
    return false;
  }
  if (/^\d+$/.test(cleaned) || REPEATED_SYMBOL_PATTERN.test(cleaned)) {
    return false;
  }
  const letters = cleaned.match(/\p{L}/gu) ?? [];
  if (letters.length < 2) {
    return false;
  }
  const punctuation = cleaned.match(/[^\p{L}\p{M}\d\s]/gu) ?? [];
  if (punctuation.length > 4) {
    return false;
  }
  return /^[\p{L}\p{M}][\p{L}\p{M}\d\s,.'()-]*[\p{L}\p{M}\d)]$/u.test(cleaned);
}

export const registrationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter the candidate's full name (at least 2 characters).")
    .max(FULL_NAME_MAX_LENGTH, `Full name must be ${FULL_NAME_MAX_LENGTH} characters or fewer.`)
    .refine(isValidFullName, "Please enter a valid full name without numbers, HTML, or links."),
  mobileNumber: z
    .string()
    .trim()
    .min(1, "Please enter a valid 10-digit Indian mobile number (or +country code).")
    .max(
      MOBILE_INPUT_MAX_LENGTH,
      `Mobile number must be ${MOBILE_INPUT_MAX_LENGTH} characters or fewer.`,
    )
    .refine(
      isValidRegistrationPhone,
      "Please enter a valid 10-digit Indian mobile number (or +country code).",
    ),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX_LENGTH, `Email address must be ${EMAIL_MAX_LENGTH} characters or fewer.`)
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Please enter a valid email address or leave it blank.",
    ),
  city: z
    .string()
    .trim()
    .refine(
      (value) => normalizeWhitespace(value).length >= 2,
      "Please select or enter a valid city or town (at least 2 characters).",
    )
    .refine(
      (value) => normalizeWhitespace(value).length <= CITY_INPUT_MAX_LENGTH,
      `City name must be ${CITY_INPUT_MAX_LENGTH} characters or fewer.`,
    )
    .refine(
      isValidCityName,
      "Please enter a valid city name without URLs, HTML, numbers only, or special symbols.",
    ),
  profileType: z.enum(PROFILE_TYPES, {
    message: "Please select Bride or Groom.",
  }),
  acceptedTerms: z.boolean().refine((value) => value === true, {
    message: "You must accept the Terms and Conditions to continue.",
  }),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

export const REGISTRATION_DEFAULT_VALUES: RegistrationFormValues = {
  fullName: "",
  mobileNumber: "",
  email: "",
  city: "",
  profileType: "Bride",
  acceptedTerms: false,
};
