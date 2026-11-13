import {
  normalizeMobileNumber,
  normalizeWhitespace,
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/features/registration/registration-schema";

const PLACEHOLDER_WHATSAPP_NUMBERS = new Set(["919000000000", "0000000000"]);

/**
 * Returns normalized digits if a real configured business WhatsApp number is provided,
 * or null if unset / still a template placeholder.
 */
export function resolveConfiguredWhatsAppNumber(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const digits = candidate.replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15 && !PLACEHOLDER_WHATSAPP_NUMBERS.has(digits)) {
      return digits;
    }
  }
  return null;
}

export function formatRegistrationWhatsAppMessage(values: RegistrationFormValues): string {
  const fullName = normalizeWhitespace(values.fullName);
  const mobileNumber = normalizeMobileNumber(values.mobileNumber);
  const city = normalizeWhitespace(values.city);
  const email = values.email.trim();

  const lines = [
    "Namaskaram Capital Chowdary Matrimony,",
    "",
    "I would like to initiate a matrimonial registration inquiry:",
    `Profile Type: ${values.profileType}`,
    `Full Name: ${fullName}`,
    `Mobile Number: ${mobileNumber}`,
    `City: ${city}`,
  ];

  if (email) {
    lines.push(`Email: ${email}`);
  }

  lines.push("Terms & Conditions: Accepted");
  return lines.join("\n");
}

export function buildWhatsAppRegistrationUrl(
  businessWhatsAppDigits: string,
  values: RegistrationFormValues,
): string {
  const digits = businessWhatsAppDigits.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    throw new Error("Configured business WhatsApp number is invalid.");
  }

  const parsed = registrationFormSchema.safeParse(values);
  if (!parsed.success) {
    throw new Error("Registration details failed validation.");
  }

  const message = formatRegistrationWhatsAppMessage(parsed.data);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
