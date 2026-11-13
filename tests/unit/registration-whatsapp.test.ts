import { describe, expect, it } from "vitest";
import { registrationFormSchema } from "@/features/registration/registration-schema";
import {
  buildWhatsAppRegistrationUrl,
  formatRegistrationWhatsAppMessage,
  resolveConfiguredWhatsAppNumber,
} from "@/features/registration/whatsapp-url";

describe("registration schema and WhatsApp redirect helpers", () => {
  it("validates a complete bride or groom registration payload", () => {
    const parsed = registrationFormSchema.safeParse({
      fullName: "Srinivas Rao",
      mobileNumber: "9876543210",
      email: "",
      city: "Narasaraopet",
      profileType: "Groom",
      acceptedTerms: true,
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid mobile numbers and missing consent", () => {
    const parsed = registrationFormSchema.safeParse({
      fullName: "Lakshmi",
      mobileNumber: "12345",
      email: "not-an-email",
      city: "Guntur",
      profileType: "Bride",
      acceptedTerms: false,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      expect(fields.mobileNumber).toBeDefined();
      expect(fields.email).toBeDefined();
      expect(fields.acceptedTerms).toBeDefined();
    }
  });

  it("ignores template placeholder WhatsApp numbers and accepts real configured numbers", () => {
    expect(resolveConfiguredWhatsAppNumber("919000000000")).toBeNull();
    expect(resolveConfiguredWhatsAppNumber(undefined, "+91 98480 12345")).toBe("919848012345");
  });

  it("builds an encoded wa.me URL with all submitted registration fields", () => {
    const values = {
      fullName: "Anusha Devi",
      mobileNumber: "+91 98480 12345",
      email: "anusha@example.com",
      city: "Narasaraopet",
      profileType: "Bride" as const,
      acceptedTerms: true,
    };

    const message = formatRegistrationWhatsAppMessage(values);
    expect(message).toContain("Profile Type: Bride");
    expect(message).toContain("Full Name: Anusha Devi");
    expect(message).toContain("City: Narasaraopet");

    const url = buildWhatsAppRegistrationUrl("919848012345", values);
    expect(url.startsWith("https://wa.me/919848012345?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1] ?? "")).toBe(message);
  });
});
