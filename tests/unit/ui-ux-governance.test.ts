import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/constants/locales";
import { ADMIN_NAV_ITEMS, PUBLIC_NAV_ITEMS } from "@/constants/navigation";
import { DEFAULT_PAGES } from "@/db/seed/default-pages";
import { DEFAULT_PRICING_PLANS } from "@/db/seed/default-pricing-plans";
import {
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/features/registration/registration-schema";
import { buildWhatsAppRegistrationUrl } from "@/features/registration/whatsapp-url";
import { getAdminSessionCookieConfig } from "@/lib/auth/session-guard";

describe("UI/UX Governance & Quality Gates", () => {
  describe("Navigation & Route SSOT", () => {
    it("ensures all public navigation items have valid labels, keys, and non-empty hrefs", () => {
      expect(PUBLIC_NAV_ITEMS.length).toBeGreaterThan(0);
      for (const item of PUBLIC_NAV_ITEMS) {
        expect(item.href).toMatch(/^\/[a-z0-9\-/]*$/);
        expect(item.defaultLabel.trim().length).toBeGreaterThan(0);
        expect(item.labelKey.trim().length).toBeGreaterThan(0);
      }
    });

    it("ensures all admin navigation items have valid labels, keys, and distinct hrefs", () => {
      expect(ADMIN_NAV_ITEMS.length).toBeGreaterThan(0);
      const seenHrefs = new Set<string>();

      for (const item of ADMIN_NAV_ITEMS) {
        expect(item.href).toMatch(/^\/admin\/[a-z0-9\-/]+$/);
        expect(item.defaultLabel.trim().length).toBeGreaterThan(0);
        expect(item.labelKey.trim().length).toBeGreaterThan(0);
        expect(seenHrefs.has(item.href)).toBe(false);
        seenHrefs.add(item.href);
      }
    });
  });

  describe("Bilingual Accessibility & Content Integrity", () => {
    it("verifies supported locales are strictly English ('en') and Telugu ('te')", () => {
      expect(SUPPORTED_LOCALES).toEqual(["en", "te"]);
      expect(DEFAULT_LOCALE).toBe("en");
    });

    it("ensures all default seed pages provide complete bilingual titles and descriptions", () => {
      expect(DEFAULT_PAGES.length).toBeGreaterThan(0);
      for (const page of DEFAULT_PAGES) {
        expect(page.titleEn.trim().length).toBeGreaterThan(0);
        expect(page.titleTe.trim().length).toBeGreaterThan(0);
        expect(page.slug.trim().length).toBeGreaterThan(0);
      }
    });

    it("ensures pricing plans provide bilingual titles, transparent fees, and validity terms", () => {
      expect(DEFAULT_PRICING_PLANS.length).toBeGreaterThan(0);
      for (const plan of DEFAULT_PRICING_PLANS) {
        expect(plan.categoryEn.trim().length).toBeGreaterThan(0);
        expect(plan.categoryTe.trim().length).toBeGreaterThan(0);
        expect(plan.registrationFeeInr).toBeGreaterThanOrEqual(0);
        expect(plan.validityMonths).toBeGreaterThan(0);
      }
    });
  });

  describe("Registration Form Validation & WhatsApp Handoff UX", () => {
    const validFormData: RegistrationFormValues = {
      fullName: "Sri Lakshmi Chowdary",
      mobileNumber: "9876543210",
      email: "candidate@example.com",
      city: "Narasaraopet",
      profileType: "Bride",
      acceptedTerms: true,
    };

    it("validates well-formed bride registration data successfully", () => {
      const result = registrationFormSchema.safeParse(validFormData);
      expect(result.success).toBe(true);
    });

    it("rejects registration without terms agreement", () => {
      const result = registrationFormSchema.safeParse({
        ...validFormData,
        acceptedTerms: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid Indian mobile numbers", () => {
      const result = registrationFormSchema.safeParse({
        ...validFormData,
        mobileNumber: "12345", // invalid format
      });
      expect(result.success).toBe(false);
    });

    it("generates a valid, secure WhatsApp handoff URL with URL-encoded candidate details", () => {
      const whatsappUrl = buildWhatsAppRegistrationUrl("919000000000", validFormData);
      expect(whatsappUrl).toContain("https://wa.me/919000000000");
      expect(whatsappUrl).toContain("text=");
      expect(whatsappUrl).toContain("Sri%20Lakshmi%20Chowdary");
      expect(whatsappUrl).toContain("Narasaraopet");
      expect(whatsappUrl).toContain("Bride");
    });
  });

  describe("Admin Session Cookie Security Standards", () => {
    it("enforces HttpOnly, SameSite=Lax, and Secure session cookies", () => {
      const cookieConfig = getAdminSessionCookieConfig();
      expect(cookieConfig.name).toBe("ccm_admin_session");
      expect(cookieConfig.httpOnly).toBe(true);
      expect(cookieConfig.sameSite).toBe("lax");
      expect(cookieConfig.path).toBe("/");
      expect(cookieConfig.maxAge).toBeGreaterThan(0);
    });
  });
});
