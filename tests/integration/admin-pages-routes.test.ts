import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { adminUsers, contentRevisions, contentSections, pages } from "@/db/schema";
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

describe("admin pages API routes", () => {
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
      id: "page-about",
      slug: "about",
      titleEn: "About Us",
      titleTe: "మా గురించి",
      summaryEn: "About the bureau",
      summaryTe: "బ్యూరో గురించి",
      bodyEn: "Detailed history",
      bodyTe: "చరిత్ర",
      status: "published",
    });

    await activeTestDb.insert(contentSections).values({
      id: "sec-about-mission",
      pageId: "page-about",
      sectionKey: "mission",
      titleEn: "Our Mission",
      titleTe: "మా లక్ష్యం",
      status: "published",
    });
  });

  it("GET /api/admin/pages returns all pages", async () => {
    const { GET: getPagesHandler } = await import("@/app/api/admin/pages/route");
    const response = await getPagesHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: Array<{ slug: string }> };
    expect(json.ok).toBe(true);
    expect(json.data.some((p) => p.slug === "about")).toBe(true);
  });

  it("GET /api/admin/pages/[id] returns page details and child sections", async () => {
    const { GET: getPageHandler } = await import("@/app/api/admin/pages/[id]/route");
    const response = await getPageHandler(
      new Request("http://localhost:3000/api/admin/pages/page-about"),
      {
        params: Promise.resolve({ id: "page-about" }),
      },
    );
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      ok: boolean;
      data: { page: { id: string; titleEn: string }; sections: Array<{ sectionKey: string }> };
    };
    expect(json.ok).toBe(true);
    expect(json.data.page.id).toBe("page-about");
    expect(json.data.sections).toHaveLength(1);
    expect(json.data.sections[0]?.sectionKey).toBe("mission");
  });

  it("PATCH /api/admin/pages/[id] updates content and logs revision", async () => {
    const { PATCH: patchPageHandler } = await import("@/app/api/admin/pages/[id]/route");
    const payload = {
      titleEn: "About Capital Chowdary Matrimony",
      titleTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ గురించి",
      summaryEn: "Updated summary",
      summaryTe: "నవీకరించబడిన సారాంశం",
      bodyEn: "Updated comprehensive history and founder profile.",
      bodyTe: "నవీకరించబడిన చరిత్ర.",
      status: "published" as const,
    };

    const request = new Request("http://localhost:3000/api/admin/pages/page-about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await patchPageHandler(request, {
      params: Promise.resolve({ id: "page-about" }),
    });
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: { titleEn: string } };
    expect(json.ok).toBe(true);
    expect(json.data.titleEn).toBe("About Capital Chowdary Matrimony");

    // Check DB persistence
    const [persisted] = await activeTestDb.select().from(pages).where(eq(pages.id, "page-about"));
    expect(persisted?.titleEn).toBe("About Capital Chowdary Matrimony");

    // Check revision
    const revisions = await activeTestDb
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.entityType, "page"));
    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.action).toBe("update");
  });
});
