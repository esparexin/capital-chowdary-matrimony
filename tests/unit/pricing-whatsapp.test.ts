import { describe, expect, it } from "vitest";
import type { FormattedPricingPlanItem } from "@/components/public/PricingPlanCard";
import {
  DEFAULT_WHATSAPP_PHONE_DIGITS,
  buildPricingPlanWhatsAppUrl,
  formatPricingPlanWhatsAppMessage,
} from "@/features/pricing/pricing-whatsapp";

const samplePlan: FormattedPricingPlanItem = {
  id: "plan-software",
  categoryEn: "Software Employees",
  categoryTe: "సాఫ్ట్‌వేర్ ఉద్యోగులు",
  validityMonths: 11,
  registrationFeeFormatted: "₹5,000",
  maleCommissionFormatted: "₹75,000",
  femaleCommissionFormatted: "₹60,000",
  termsEn: "Registration fee is valid for 11 months.",
  termsTe: "రిజిస్ట్రేషన్ ఫీజు 11 నెలల వరకు వర్తిస్తుంది.",
};

describe("pricing WhatsApp integration", () => {
  it("formats English WhatsApp message correctly with all plan details", () => {
    const message = formatPricingPlanWhatsAppMessage(samplePlan, false);

    expect(message).toContain("Capital Chowdary Matrimony");
    expect(message).toContain("Software Employees");
    expect(message).toContain("Registration Fee (11 months): ₹5,000");
    expect(message).toContain("Groom Side Commission: ₹75,000");
    expect(message).toContain("Bride Side Commission: ₹60,000");
    expect(message).toContain(
      "Please share more details and guide me with the registration process.",
    );
  });

  it("formats Telugu WhatsApp message correctly with all plan details", () => {
    const message = formatPricingPlanWhatsAppMessage(samplePlan, true);

    expect(message).toContain("క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ");
    expect(message).toContain("సాఫ్ట్‌వేర్ ఉద్యోగులు");
    expect(message).toContain("రిజిస్ట్రేషన్ ఫీజు (11 నెలలు): ₹5,000");
    expect(message).toContain("వరుడు వైపు కమీషన్: ₹75,000");
    expect(message).toContain("వధువు వైపు కమీషన్: ₹60,000");
    expect(message).toContain("దయచేసి మరిన్ని వివరాలు తెలిపి, రిజిస్ట్రేషన్ ప్రక్రియలో నాకు సహాయం చేయగలరు.");
  });

  it("builds valid WhatsApp URL targeting verified phone number with encoded message", () => {
    const url = buildPricingPlanWhatsAppUrl(samplePlan, false, "+91 78420 97842");
    const parsed = new URL(url);

    expect(parsed.origin).toBe("https://api.whatsapp.com");
    expect(parsed.pathname).toBe("/send/");
    expect(parsed.searchParams.get("phone")).toBe("917842097842");
    expect(parsed.searchParams.get("text")).toContain("Software Employees");
    expect(parsed.searchParams.get("text")).toContain("Capital Chowdary Matrimony");
  });

  it("falls back to default official WhatsApp phone digits if unconfigured or empty", () => {
    const url = buildPricingPlanWhatsAppUrl(samplePlan, true, null);
    const parsed = new URL(url);

    expect(parsed.searchParams.get("phone")).toBe(DEFAULT_WHATSAPP_PHONE_DIGITS);
    expect(parsed.searchParams.get("text")).toContain("క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ");
    expect(parsed.searchParams.get("text")).toContain("సాఫ్ట్‌వేర్ ఉద్యోగులు");
  });
});
