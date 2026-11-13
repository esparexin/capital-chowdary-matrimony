import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAGES,
  DEFAULT_PRICING_PLANS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  TERMS_ACCEPTANCE_EN,
  TERMS_ACCEPTANCE_TE,
  TERMS_CONDITIONS_EN,
  TERMS_CONDITIONS_TE,
} from "@/db/seed/default-content";

describe("default-content seed integrity", () => {
  it("preserves all 11 Telugu and English terms and 3 acceptance points", () => {
    expect(TERMS_CONDITIONS_TE).toHaveLength(11);
    expect(TERMS_CONDITIONS_EN).toHaveLength(11);
    expect(TERMS_ACCEPTANCE_TE).toHaveLength(3);
    expect(TERMS_ACCEPTANCE_EN).toHaveLength(3);
  });

  it("marks pricing plans and terms page as pending review and draft", () => {
    expect(DEFAULT_PRICING_PLANS).toHaveLength(4);
    for (const plan of DEFAULT_PRICING_PLANS) {
      expect(plan.verificationStatus).toBe("pending_review");
      expect(plan.status).toBe("draft");
      expect(plan.validityMonths).toBe(11);
    }

    const termsPage = DEFAULT_PAGES.find((page) => page.slug === "terms-and-conditions");
    expect(termsPage).toBeDefined();
    expect(termsPage?.verificationStatus).toBe("pending_review");
    expect(termsPage?.status).toBe("draft");
  });

  it("includes verified business contact details and all 4 services", () => {
    expect(DEFAULT_SITE_SETTINGS.phoneNumber).toBe("+91 78420 97842");
    expect(DEFAULT_SITE_SETTINGS.whatsappNumber).toBe("+91 78420 97842");
    expect(DEFAULT_SITE_SETTINGS.contactEmail).toBe("capitalmatrimony@gmail.com");
    expect(DEFAULT_SITE_SETTINGS.mapUrl).toBe(
      "https://www.google.com/maps/search/?api=1&query=Ravipadu%20Road%20Narasaraopet%20522601",
    );
    expect(DEFAULT_SITE_SETTINGS.isContactVerified).toBe(true);
    expect(DEFAULT_SERVICES).toHaveLength(4);
  });
});
