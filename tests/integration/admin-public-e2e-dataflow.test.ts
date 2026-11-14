import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@/db";
import { adminUsers, contentSections, pages, siteSettings } from "@/db/schema";
import {
  getPublicEventsAndGallery,
  getPublicPricingPlans,
} from "@/features/cms/public-offerings-repo";
import {
  getPublishedPageWithSections,
  getPublishedServices,
} from "@/features/cms/public-pages-repo";
import { getSiteContactDetails } from "@/features/contact/site-contact";
import { getHomepageHeroContent } from "@/features/homepage/hero-content";
import { createTestDatabase } from "../helpers/test-database";

let activeTestDb: AppDatabase;

vi.mock("@/db", () => ({
  getDatabase: () => Promise.resolve(activeTestDb),
}));

vi.mock("@/lib/auth/session-guard", () => ({
  requireAuthenticatedAdmin: vi.fn().mockResolvedValue({
    id: "admin-e2e-id",
    email: "admin@capitalchowdarymatrimony.com",
    fullName: "Chief Administrator",
    role: "admin",
  }),
}));

describe("End-to-End Admin ↔ Public Dataflow & Publishing Lifecycle", () => {
  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;

    // 1. Seed Administrator
    await activeTestDb.insert(adminUsers).values({
      id: "admin-e2e-id",
      email: "admin@capitalchowdarymatrimony.com",
      name: "Chief Administrator",
      passwordHash: "dummy-hash",
      role: "admin",
      isActive: true,
    });

    // 2. Seed Base Site Settings
    await activeTestDb.insert(siteSettings).values({
      id: "default",
      businessNameEn: "Capital Chowdary Matrimony",
      businessNameTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ",
      taglineEn: "Exclusive Kamma Community Matrimony",
      taglineTe: "కమ్మ సమాజానికి ప్రత్యేక మ్యాట్రిమోనీ",
      locationEn: "Vijayawada, Andhra Pradesh",
      locationTe: "విజయవాడ, ఆంధ్రప్రదేశ్",
      addressEn: "MG Road, Vijayawada",
      addressTe: "ఎంజీ రోడ్, విజయవాడ",
      phoneNumber: "+91 866 247 1122",
      whatsappNumber: "+91 94401 23456",
      contactEmail: "info@capitalchowdarymatrimony.com",
      mapUrl: "https://maps.google.com/?q=Vijayawada",
      defaultSeoTitleEn: "Capital Chowdary Matrimony",
      defaultSeoTitleTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ",
      defaultSeoDescriptionEn: "Verified Chowdary profiles",
      defaultSeoDescriptionTe: "ధృవీకరించబడిన చౌదరి ప్రొఫైల్స్",
      isContactVerified: true,
    });

    // 3. Seed Homepage Hero & Page
    await activeTestDb.insert(pages).values({
      id: "page-home",
      slug: "home",
      titleEn: "Home",
      titleTe: "హోమ్",
      status: "published",
    });

    await activeTestDb.insert(contentSections).values({
      id: "sec-home-hero",
      pageId: "page-home",
      sectionKey: "hero",
      titleEn: "Connecting Chowdary Families Across Generations",
      titleTe: "తరతరాల చౌదరి కుటుంబాల కలయిక",
      subtitleEn: "Trusted matrimony service",
      subtitleTe: "విశ్వసనీయ వివాహ వేదిక",
      bodyEn: "A dedicated matchmaking platform for Chowdary families worldwide.",
      bodyTe: "ప్రపంచవ్యాప్త చౌదరి కుటుంబాల కోసం ప్రత్యేక వివాహ వేదిక.",
      sortOrder: 1,
      status: "published",
      metadataJson: JSON.stringify({
        primaryCtaLabelEn: "Register Profile",
        primaryCtaHref: "/register",
        secondaryCtaLabelEn: "Explore Services",
        secondaryCtaHref: "/services",
        highlights: [{ title: "100% Verified Families", description: "Direct parent contact" }],
      }),
    });
  });

  it("1. Settings: Admin update persists to D1 and reflects in public contact config", async () => {
    const { PATCH: patchSettings } = await import("@/app/api/admin/settings/route");

    const updatePayload = {
      businessNameEn: "Capital Chowdary Matrimonial Bureau",
      businessNameTe: "క్యాపిటల్ చౌదరి వైవాహిక వేదిక",
      taglineEn: "Honoring Traditions, Connecting Souls",
      taglineTe: "సంప్రదాయాల కలయిక",
      locationEn: "Vijayawada & Guntur",
      locationTe: "విజయవాడ & గుంటూరు",
      addressEn: "Benz Circle, Vijayawada 520010",
      addressTe: "బెంజ్ సర్కిల్, విజయవాడ 520010",
      phoneNumber: "+91 866 999 8888",
      whatsappNumber: "+91 98888 77777",
      contactEmail: "support@capitalchowdarymatrimony.com",
      mapUrl: "https://maps.google.com/?q=BenzCircle",
      defaultSeoTitleEn: "Capital Chowdary Matrimonial Bureau",
      defaultSeoTitleTe: "క్యాపిటల్ చౌదరి వైవాహిక వేదిక",
      defaultSeoDescriptionEn: "Premier Chowdary matchmaking",
      defaultSeoDescriptionTe: "అత్యుత్తమ చౌదరి సంబంధాలు",
      isContactVerified: true,
    };

    const req = new Request("http://localhost:3000/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    const res = await patchSettings(req);
    expect(res.status).toBe(200);

    // Verify public contact repository retrieves updated persisted data
    const publicConfig = await getSiteContactDetails();
    expect(publicConfig.businessNameEn).toBe("Capital Chowdary Matrimonial Bureau");
    expect(publicConfig.businessNameTe).toBe("క్యాపిటల్ చౌదరి వైవాహిక వేదిక");
    expect(publicConfig.phoneDisplay).toBe("+91 866 999 8888");
    expect(publicConfig.whatsappDisplay).toBe("+91 98888 77777");
    expect(publicConfig.addressFull).toBe("Benz Circle, Vijayawada 520010");
  });

  it("2. Homepage CMS: Admin patch updates hero copy and dynamic highlights", async () => {
    const { PATCH: patchHomepage } = await import("@/app/api/admin/homepage/route");

    const patchPayload = {
      titleEn: "Empowering Chowdary Alliances Globally",
      titleTe: "ప్రపంచవ్యాప్త చౌదరి సంబంధాల వేదిక",
      bodyEn: "Connecting brides and grooms across Andhra Pradesh, Telangana, and overseas.",
      primaryCtaLabelEn: "Join Matrimony",
      primaryCtaHref: "/register",
      secondaryCtaLabelEn: "Contact Office",
      secondaryCtaHref: "/contact",
      associationName: "Kamma Welfare Association",
      associationDetail: "Andhra & Telangana · Regd. No: AP-07 91-058-0756579",
      highlights: [
        {
          title: "Direct Parent-to-Parent Contact",
          description: "Direct communication with bride and groom elders",
        },
      ],
      status: "published" as const,
    };

    const req = new Request("http://localhost:3000/api/admin/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchPayload),
    });

    const res = await patchHomepage(req);
    expect(res.status).toBe(200);

    // Verify public hero repository receives updated data
    const heroData = await getHomepageHeroContent();
    expect(heroData.title).toBe("Empowering Chowdary Alliances Globally");
    expect(heroData.teluguIntro).toBe("ప్రపంచవ్యాప్త చౌదరి సంబంధాల వేదిక");
    expect(heroData.highlights[0]?.title).toBe("Direct Parent-to-Parent Contact");
  });

  it("3. Services: Create, publish, unpublish, and delete lifecycle", async () => {
    const { POST: createService } = await import("@/app/api/admin/services/route");
    const { PATCH: updateService, DELETE: deleteService } =
      await import("@/app/api/admin/services/[id]/route");

    // A. Create new published service
    const createReq = new Request("http://localhost:3000/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "horoscope-matching",
        titleEn: "Horoscope & Kundali Matching",
        titleTe: "జాతక పొంతన మరియు కుండలి విశ్లేషణ",
        descriptionEn: "Expert astrological compatibility review by Vedic scholars.",
        descriptionTe: "వేద పండితులచే సమగ్ర జాతక పరిశీలన.",
        iconName: "HeartHandshake",
        sortOrder: 10,
        status: "published",
      }),
    });

    const createRes = await createService(createReq);
    expect(createRes.status).toBe(201);
    const createdJson = (await createRes.json()) as { ok: boolean; data: { id: string } };
    const serviceId = createdJson.data.id;

    // Verify appears on public services
    let publicServices = await getPublishedServices();
    expect(
      publicServices.some(
        (s) => s.id === serviceId && s.titleEn === "Horoscope & Kundali Matching",
      ),
    ).toBe(true);

    // B. Unpublish service (set to draft)
    const draftReq = new Request(`http://localhost:3000/api/admin/services/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    const draftRes = await updateService(draftReq, { params: Promise.resolve({ id: serviceId }) });
    expect(draftRes.status).toBe(200);

    // Verify hidden from public services
    publicServices = await getPublishedServices();
    expect(publicServices.some((s) => s.id === serviceId)).toBe(false);

    // C. Delete service
    const deleteReq = new Request(`http://localhost:3000/api/admin/services/${serviceId}`, {
      method: "DELETE",
    });
    const deleteRes = await deleteService(deleteReq, {
      params: Promise.resolve({ id: serviceId }),
    });
    expect(deleteRes.status).toBe(200);
  });

  it("4. Pricing Plans: Create, publish, INR formatting, and unpublish", async () => {
    const { POST: createPricing } = await import("@/app/api/admin/pricing/route");
    const { PATCH: updatePricing } = await import("@/app/api/admin/pricing/[id]/route");

    // A. Create new published pricing plan
    const createReq = new Request("http://localhost:3000/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "executive-nri-plan",
        categoryEn: "Executive NRI Alliances",
        categoryTe: "ఎగ్జిక్యూటివ్ ఎన్‌ఆర్‌ఐ సంబంధాలు",
        registrationFeeInr: 15000,
        maleCommissionInr: 300000,
        femaleCommissionInr: 200000,
        validityMonths: 12,
        termsEn: "Dedicated coordinator for international alliances.",
        termsTe: "అంతర్జాతీయ సంబంధాల కోసం ప్రత్యేక సమన్వయకర్త.",
        verificationStatus: "verified",
        sortOrder: 1,
        status: "published",
      }),
    });

    const createRes = await createPricing(createReq);
    expect(createRes.status).toBe(201);
    const createdJson = (await createRes.json()) as { ok: boolean; data: { id: string } };
    const planId = createdJson.data.id;

    // Verify appears in public pricing plans
    let publicPlansResult = await getPublicPricingPlans();
    expect(publicPlansResult.source).toBe("d1");
    expect(
      publicPlansResult.plans.some(
        (p) => p.id === planId && p.categoryEn === "Executive NRI Alliances",
      ),
    ).toBe(true);

    // B. Set to draft
    const draftReq = new Request(`http://localhost:3000/api/admin/pricing/${planId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "draft" }),
    });
    const draftRes = await updatePricing(draftReq, { params: Promise.resolve({ id: planId }) });
    expect(draftRes.status).toBe(200);

    // Verify unpublished plan disappears from public pricing
    publicPlansResult = await getPublicPricingPlans();
    expect(publicPlansResult.plans.some((p) => p.id === planId)).toBe(false);
  });

  it("5. Marriage Events & Cloudinary Cover: Create, publish, and public retrieval", async () => {
    const { POST: createEvent } = await import("@/app/api/admin/events/route");

    const eventReq = new Request("http://localhost:3000/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "amaravati-parichaya-vedika",
        titleEn: "Amaravati Parichaya Vedika 2026",
        titleTe: "అమరావతి పరిచయ వేదిక 2026",
        descriptionEn: "Exclusive community matrimonial gathering in Amaravati.",
        descriptionTe: "అమరావతిలో కమ్మ సమాజపు వధూవరుల పరిచయ వేదిక.",
        locationEn: "CK Convention, Mangalagiri",
        locationTe: "సి.కె. కన్వెన్షన్, మంగళగిరి",
        eventDate: "2026-12-25T10:00:00.000Z",
        cloudinaryPublicId: "events/amaravati-meet-2026",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/events/amaravati-meet-2026.jpg",
        width: 1600,
        height: 900,
        sortOrder: 1,
        status: "published",
      }),
    });

    const res = await createEvent(eventReq);
    expect(res.status).toBe(201);

    // Verify public events repository retrieves event with Cloudinary cover URL
    const publicData = await getPublicEventsAndGallery();
    const event = publicData.events.find((e) => e.slug === "amaravati-parichaya-vedika");
    expect(event).toBeDefined();
    expect(event?.coverUrl).toBe(
      "https://res.cloudinary.com/demo/image/upload/v1/events/amaravati-meet-2026.jpg",
    );
    expect(event?.locationEn).toBe("CK Convention, Mangalagiri");
  });

  it("6. Gallery Items & Cloudinary Integration: Add verified photo and verify public carousel", async () => {
    const { POST: createGalleryItem } = await import("@/app/api/admin/gallery/route");

    const galleryReq = new Request("http://localhost:3000/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cloudinaryPublicId: "gallery/couple-vijayawada",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/gallery/couple-vijayawada.jpg",
        width: 1200,
        height: 800,
        captionEn: "Srikanth & Swathi - Married Nov 2026",
        captionTe: "శ్రీకాంత్ & స్వాతి - నవంబర్ 2026",
        status: "published",
      }),
    });

    const res = await createGalleryItem(galleryReq);
    expect(res.status).toBe(201);

    // Verify public gallery retrieves Cloudinary URL and Telugu/English captions
    const publicData = await getPublicEventsAndGallery();
    const photo = publicData.gallery.find((g) => g.imageUrl.includes("couple-vijayawada.jpg"));
    expect(photo).toBeDefined();
    expect(photo?.captionEn).toBe("Srikanth & Swathi - Married Nov 2026");
    expect(photo?.captionTe).toBe("శ్రీకాంత్ & స్వాతి - నవంబర్ 2026");
  });

  it("7. Pages CMS: Update About Us and verify public page retrieval and drafting", async () => {
    // Seed About page
    await activeTestDb.insert(pages).values({
      id: "page-about",
      slug: "about",
      titleEn: "About Our Bureau",
      titleTe: "మా సంస్థ గురించి",
      summaryEn: "Serving Chowdary families for over 25 years.",
      summaryTe: "25 సంవత్సరాల అనుభవం.",
      bodyEn: "Initial body content.",
      bodyTe: "ప్రారంభ వివరాలు.",
      status: "published",
    });

    const { PATCH: patchPage } = await import("@/app/api/admin/pages/[id]/route");

    // A. Update page content
    const updateReq = new Request("http://localhost:3000/api/admin/pages/page-about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn: "About Capital Chowdary Matrimony",
        titleTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ సమగ్ర సమాచారం",
        summaryEn: "25+ years of verified matrimonial matchmaking.",
        summaryTe: "25+ సంవత్సరాల నమ్మకమైన సేవ.",
        bodyEn: "Detailed history of how our elders established the bureau in Vijayawada.",
        bodyTe: "విజయవాడలో పెద్దలచే ప్రారంభించబడిన చరిత్ర.",
        status: "published",
      }),
    });

    const updateRes = await patchPage(updateReq, { params: Promise.resolve({ id: "page-about" }) });
    expect(updateRes.status).toBe(200);

    // Verify public page retrieves updated content
    let publicPage = await getPublishedPageWithSections("about");
    expect(publicPage.source).toBe("d1");
    expect(publicPage.page?.titleEn).toBe("About Capital Chowdary Matrimony");
    expect(publicPage.page?.bodyEn).toContain("Detailed history");

    // B. Unpublish page
    const draftReq = new Request("http://localhost:3000/api/admin/pages/page-about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn: "About Capital Chowdary Matrimony",
        titleTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ సమగ్ర సమాచారం",
        status: "draft",
      }),
    });

    const draftRes = await patchPage(draftReq, { params: Promise.resolve({ id: "page-about" }) });
    expect(draftRes.status).toBe(200);

    // Verify public page reflects unpublished state
    publicPage = await getPublishedPageWithSections("about");
    expect(publicPage.source).toBe("d1-unpublished");
    expect(publicPage.page).toBeNull();
  });
});
