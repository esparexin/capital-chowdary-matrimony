import type { FormattedPricingPlanItem } from "@/components/public/PricingPlanCard";

export const DEFAULT_WHATSAPP_PHONE_DIGITS = "917842097842";

/**
 * Formats a localized inquiry message for WhatsApp regarding a specific pricing plan.
 * Dynamically includes website name, plan title, prices, and validity.
 */
export function formatPricingPlanWhatsAppMessage(
  plan: FormattedPricingPlanItem,
  isTelugu: boolean,
): string {
  if (isTelugu) {
    return [
      "నమస్కారం క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ,",
      "",
      "నేను ఈ క్రింది సభ్యత్వ ప్లాన్ పట్ల ఆసక్తి కలిగి ఉన్నాను:",
      `* ప్లాన్: ${plan.categoryTe}`,
      `* రిజిస్ట్రేషన్ ఫీజు (${plan.validityMonths} నెలలు): ${plan.registrationFeeFormatted}`,
      `* వరుడు వైపు కమీషన్: ${plan.maleCommissionFormatted}`,
      `* వధువు వైపు కమీషన్: ${plan.femaleCommissionFormatted}`,
      "",
      "దయచేసి మరిన్ని వివరాలు తెలిపి, రిజిస్ట్రేషన్ ప్రక్రియలో నాకు సహాయం చేయగలరు.",
    ].join("\n");
  }

  return [
    "Namaste Capital Chowdary Matrimony,",
    "",
    "I am interested in this membership plan:",
    `* Plan: ${plan.categoryEn}`,
    `* Registration Fee (${plan.validityMonths} months): ${plan.registrationFeeFormatted}`,
    `* Groom Side Commission: ${plan.maleCommissionFormatted}`,
    `* Bride Side Commission: ${plan.femaleCommissionFormatted}`,
    "",
    "Please share more details and guide me with the registration process.",
  ].join("\n");
}

/**
 * Builds the official WhatsApp click-to-chat URL with the prefilled membership plan inquiry.
 */
export function buildPricingPlanWhatsAppUrl(
  plan: FormattedPricingPlanItem,
  isTelugu: boolean,
  whatsappNumber?: string | null,
): string {
  const rawDigits = (whatsappNumber || DEFAULT_WHATSAPP_PHONE_DIGITS).replace(/\D/g, "");
  const digits = rawDigits.length >= 10 ? rawDigits : DEFAULT_WHATSAPP_PHONE_DIGITS;
  const message = formatPricingPlanWhatsAppMessage(plan, isTelugu);

  const params = new URLSearchParams({
    phone: digits,
    text: message,
    type: "phone_number",
    app_absent: "0",
  });

  return `https://api.whatsapp.com/send/?${params.toString()}`;
}
