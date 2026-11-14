import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { AppDatabase } from "@/db";
import {
  contentRevisions,
  galleryItems,
  marriageEvents,
  mediaAssets,
  pages,
  pricingPlans,
  services,
  siteSettings,
} from "@/db/schema";
import { createTestDatabase } from "../helpers/test-database";

let activeTestDb: AppDatabase;

vi.mock("@/db", () => ({
  getDatabase: () => Promise.resolve(activeTestDb),
}));

describe("admin dashboard overview page", () => {
  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;

    await activeTestDb.insert(siteSettings).values({
      id: "default",
      businessNameEn: "Capital Chowdary Matrimony",
      businessNameTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ",
      taglineEn: "Trusted Matrimony",
      taglineTe: "విశ్వసనీయ మ్యాట్రిమోనీ",
      locationEn: "Vijayawada",
      locationTe: "విజయవాడ",
      addressEn: "MG Road, Vijayawada",
      addressTe: "ఎంజీ రోడ్, విజయవాడ",
      phoneNumber: "+91 99999 99999",
      whatsappNumber: "+91 99999 88888",
      contactEmail: "admin@capitalchowdarymatrimony.com",
      mapUrl: "https://maps.google.com",
      defaultSeoTitleEn: "Capital Chowdary Matrimony",
      defaultSeoTitleTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ",
      defaultSeoDescriptionEn: "Exclusive matrimony",
      defaultSeoDescriptionTe: "ప్రత్యేక మ్యాట్రిమోనీ",
      isContactVerified: true,
    });

    await activeTestDb.insert(services).values([
      {
        id: "svc-1",
        slug: "personalized-matchmaking",
        titleEn: "Personalized Matchmaking",
        titleTe: "వ్యక్తిగత సంబంధాలు",
        descriptionEn: "Tailored matchmaking assistance",
        descriptionTe: "వ్యక్తిగత సహాయం",
        iconName: "HeartHandshake",
        sortOrder: 1,
        status: "published",
      },
      {
        id: "svc-2",
        slug: "draft-service",
        titleEn: "Draft Service",
        titleTe: "డ్రాఫ్ట్ సేవ",
        descriptionEn: "Under review",
        descriptionTe: "సమీక్షలో ఉంది",
        iconName: "Sparkles",
        sortOrder: 2,
        status: "draft",
      },
    ]);

    await activeTestDb.insert(pricingPlans).values([
      {
        id: "plan-1",
        slug: "software-alliances",
        categoryEn: "Software Alliances",
        categoryTe: "సాఫ్ట్‌వేర్ సంబంధాలు",
        registrationFeeInr: 10000,
        maleCommissionInr: 250000,
        femaleCommissionInr: 150000,
        validityMonths: 11,
        termsEn: "Terms in English",
        termsTe: "తెలుగు నిబంధనలు",
        sortOrder: 1,
        status: "published",
      },
    ]);

    await activeTestDb.insert(mediaAssets).values([
      {
        id: "media-1",
        cloudinaryPublicId: "events/cover-1",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/events/cover-1.jpg",
        width: 1200,
        height: 800,
        format: "jpg",
        bytes: 120000,
        resourceType: "image",
      },
    ]);

    await activeTestDb.insert(marriageEvents).values([
      {
        id: "event-1",
        slug: "vijayawada-parichaya-vedika",
        titleEn: "Vijayawada Parichaya Vedika",
        titleTe: "విజయవాడ పరిచయ వేదిక",
        descriptionEn: "Community meet",
        descriptionTe: "సమాజ కలయిక",
        locationEn: "A Convention, Vijayawada",
        locationTe: "ఏ కన్వెన్షన్, విజయవాడ",
        eventDate: "2026-12-01T10:00:00.000Z",
        status: "published",
      },
    ]);

    await activeTestDb.insert(galleryItems).values([
      {
        id: "gal-1",
        mediaAssetId: "media-1",
        captionEn: "Happy Couple",
        captionTe: "సంతోషకరమైన జంట",
        status: "published",
      },
    ]);

    await activeTestDb.insert(pages).values([
      {
        id: "page-about",
        slug: "about",
        titleEn: "About Us",
        titleTe: "మా గురించి",
        status: "published",
      },
    ]);

    await activeTestDb.insert(contentRevisions).values([
      {
        id: "rev-1",
        entityType: "service",
        entityId: "svc-1",
        action: "publish",
        snapshotJson: JSON.stringify({ id: "svc-1" }),
      },
    ]);
  });

  it("renders live operational dashboard with accurate metrics and links", async () => {
    const { default: AdminDashboardPage } = await import("@/app/admin/(protected)/dashboard/page");
    const jsx = await AdminDashboardPage();

    expect(jsx).toBeDefined();
    expect(jsx.type).toBe("div");

    // Convert JSX to string HTML to verify key content
    const html = renderToStaticMarkup(jsx);

    // Verify bureau details are loaded from D1
    expect(html).toContain("క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ");
    expect(html).toContain("Capital Chowdary Matrimony");
    expect(html).toContain("Verified Bureau");
    expect(html).toContain("+91 99999 99999");

    // Verify metric cards counts
    // Services: 1 / 2 (1 published, 2 total)
    expect(html).toContain("1 / 2");
    // Pricing: 1 / 1 (1 active, 1 total)
    expect(html).toContain("1 / 1");

    // Verify quick navigation links
    expect(html).toContain("/admin/services");
    expect(html).toContain("/admin/pricing");
    expect(html).toContain("/admin/events");
    expect(html).toContain("/admin/gallery");
    expect(html).toContain("/admin/settings");
    expect(html).toContain("/admin/homepage");
    expect(html).toContain("/admin/pages");

    // Verify recent revisions section
    expect(html).toContain("Recent Administrative Activity");
    expect(html).toContain("service");
    expect(html).toContain("publish");
  });
});
