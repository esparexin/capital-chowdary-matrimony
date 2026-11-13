import { beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { adminUsers, contentRevisions, contentSections, mediaAssets, pages } from "@/db/schema";
import { createTestDatabase } from "../helpers/test-database";

let activeTestDb: AppDatabase;

vi.mock("@/db", () => ({
  getDatabase: () => Promise.resolve(activeTestDb),
}));

vi.mock("@/lib/auth/session-guard", () => ({
  requireAuthenticatedAdmin: vi.fn().mockResolvedValue({
    id: "admin-test-id",
    email: "admin@capitalchowdarymatrimony.com",
    fullName: "Admin Tester",
    role: "admin",
  }),
}));

vi.mock("@/lib/cloudinary/cloudinary-destroy", () => ({
  deleteCloudinaryAsset: vi.fn().mockResolvedValue({ result: "ok" }),
}));

describe("admin homepage API routes", () => {
  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;

    await activeTestDb.insert(adminUsers).values({
      id: "admin-test-id",
      email: "admin@capitalchowdarymatrimony.com",
      name: "Admin Tester",
      passwordHash: "dummy-hash",
      role: "admin",
      isActive: true,
    });

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
      titleEn: "Trusted marriage alliances for Kamma families",
      titleTe: "చౌదరి (కమ్మ) కులము వారికి చక్కటి పెళ్ళి సంబంధములు కుదర్చబడును & మ్యారేజ్ ఈవెంట్స్ చేయబడును.",
      bodyEn: "Software employees, doctors, NRIs, business and government alliances.",
      metadataJson: JSON.stringify({
        primaryCtaLabelEn: "Register",
        primaryCtaHref: "/register",
        highlights: [{ title: "AP & TS", description: "Alliances across both states" }],
      }),
      status: "published",
    });
  });

  it("GET /api/admin/homepage returns hero section data", async () => {
    const { GET: getHomepageHandler } = await import("@/app/api/admin/homepage/route");
    const response = await getHomepageHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: { titleEn: string; primaryCtaLabelEn: string } };
    expect(json.ok).toBe(true);
    expect(json.data.titleEn).toBe("Trusted marriage alliances for Kamma families");
    expect(json.data.primaryCtaLabelEn).toBe("Register");
  });

  it("PATCH /api/admin/homepage updates copy and creates content revision", async () => {
    const { PATCH: patchHomepageHandler } = await import("@/app/api/admin/homepage/route");
    const payload = {
      titleEn: "Exclusive Kamma Matrimonial Services",
      titleTe: "ప్రత్యేక కమ్మ వివాహ సేవలు",
      bodyEn: "Updated bureau description for Telugu families across both states.",
      primaryCtaLabelEn: "Join Now",
      primaryCtaHref: "/register",
      secondaryCtaLabelEn: "Speak to Us",
      secondaryCtaHref: "/contact",
      associationName: "Kamma Welfare Association",
      associationDetail: "Andhra & Telangana · Regd. No: AP-07 91-058-0756579",
      highlights: [{ title: "Global Alliances", description: "USA, UK, and India" }],
      status: "published" as const,
    };

    const request = new Request("http://localhost:3000/api/admin/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await patchHomepageHandler(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: { titleEn: string } };
    expect(json.ok).toBe(true);
    expect(json.data.titleEn).toBe("Exclusive Kamma Matrimonial Services");

    // Verify DB persistence
    const [persisted] = await activeTestDb
      .select()
      .from(contentSections)
      .where(
        and(
          eq(contentSections.pageId, "page-home"),
          eq(contentSections.sectionKey, "hero"),
        ),
      );
    expect(persisted?.titleEn).toBe("Exclusive Kamma Matrimonial Services");

    // Verify revision
    const revisions = await activeTestDb
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.entityType, "content_section"));
    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.action).toBe("update");
  });

  it("PATCH /api/admin/homepage handles Cloudinary banner replacement", async () => {
    const { PATCH: patchHomepageHandler } = await import("@/app/api/admin/homepage/route");
    const payload = {
      titleEn: "Exclusive Kamma Matrimonial Services",
      titleTe: "ప్రత్యేక కమ్మ వివాహ సేవలు",
      bodyEn: "Updated bureau description for Telugu families.",
      primaryCtaLabelEn: "Register",
      primaryCtaHref: "/register",
      secondaryCtaLabelEn: "Contact Us",
      secondaryCtaHref: "/contact",
      associationName: "Kamma Welfare Association",
      associationDetail: "Regd. No: AP-07 91-058-0756579",
      highlights: [],
      status: "published" as const,
      cloudinaryPublicId: "ccm/banners/new-hero-banner",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/new-banner.jpg",
      width: 1200,
      height: 896,
      format: "jpg",
    };

    const request = new Request("http://localhost:3000/api/admin/homepage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await patchHomepageHandler(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: { bannerUrl: string } };
    expect(json.ok).toBe(true);
    expect(json.data.bannerUrl).toBe("https://res.cloudinary.com/demo/image/upload/new-banner.jpg");

    // Verify media asset was created
    const mediaRows = await activeTestDb
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.cloudinaryPublicId, "ccm/banners/new-hero-banner"));
    expect(mediaRows).toHaveLength(1);
  });
});
