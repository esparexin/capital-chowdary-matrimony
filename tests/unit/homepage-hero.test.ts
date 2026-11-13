import { describe, expect, it } from "vitest";
import { DEFAULT_HERO_CONTENT, resolveHeroContent } from "@/features/homepage/hero-content";

describe("homepage hero content resolution", () => {
  it("falls back to the exact approved hero copy and registration number when CMS records are missing", () => {
    const hero = resolveHeroContent(null, null);

    expect(hero.title).toBe("Trusted marriage alliances for Kamma families");
    expect(hero.teluguIntro).toBe(
      "చౌదరి (కమ్మ) కులము వారికి చక్కటి పెళ్ళి సంబంధములు కుదర్చబడును & మ్యారేజ్ ఈవెంట్స్ చేయబడును.",
    );
    expect(hero.associationName).toBe("Kamma Welfare Association");
    expect(hero.associationDetail).toBe("Andhra & Telangana · Regd. No: AP-07 91-058-0756579");
    expect(hero.highlights).toHaveLength(1);
    expect(hero.highlights[0]?.title).toBe("Andhra Pradesh & Telangana");
    expect(hero.primaryCtaLabel).toBe("Register");
    expect(hero.secondaryCtaLabel).toBe("Contact Us");
    expect(hero.image.src).toBe(
      "https://res.cloudinary.com/mmdlzn5o/image/upload/v1794550697/capital-chowdary-matrimony/banners/q0tqhz8dnbcgukqvxk5p.jpg",
    );
  });

  it("applies Admin Homepage CMS copy and Cloudinary media asset overrides when present", () => {
    const hero = resolveHeroContent(
      {
        titleEn: "Custom Hero Heading",
        titleTe: "కస్టమ్ తెలుగు పరిచయం",
        bodyEn: "Custom description from CMS.",
        metadataJson: JSON.stringify({
          primaryCtaLabelEn: "Start Registration",
          secondaryCtaLabelEn: "Reach Office",
          associationName: "Kamma Welfare Association",
          associationDetail: "Andhra & Telangana · Regd. No: AP-07 91-058-0756579",
        }),
      },
      {
        secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/wedding-banner.jpg",
        altEn: "Verified ceremony photo",
        width: 1400,
        height: 1050,
      },
    );

    expect(hero.title).toBe("Custom Hero Heading");
    expect(hero.teluguIntro).toBe("కస్టమ్ తెలుగు పరిచయం");
    expect(hero.description).toBe("Custom description from CMS.");
    expect(hero.primaryCtaLabel).toBe("Start Registration");
    expect(hero.secondaryCtaLabel).toBe("Reach Office");
    expect(hero.image).toEqual({
      src: "https://res.cloudinary.com/demo/image/upload/v1/wedding-banner.jpg",
      alt: "Verified ceremony photo",
      width: 1400,
      height: 1050,
    });
  });

  it("ignores malformed metadata JSON without failing", () => {
    const hero = resolveHeroContent({ metadataJson: "{not-valid-json" }, null);
    expect(hero).toEqual(DEFAULT_HERO_CONTENT);
  });
});
