import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { adminUsers, contentRevisions, siteSettings } from "@/db/schema";
import { DEFAULT_SITE_SETTINGS } from "@/db/seed/default-content";
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

describe("admin settings API routes", () => {
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

    await activeTestDb.insert(siteSettings).values(DEFAULT_SITE_SETTINGS);
  });

  it("GET /api/admin/settings returns the default site settings", async () => {
    const { GET: getSettingsHandler } = await import("@/app/api/admin/settings/route");
    const response = await getSettingsHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: typeof DEFAULT_SITE_SETTINGS };
    expect(json.ok).toBe(true);
    expect(json.data.businessNameEn).toBe("Capital Chowdary Matrimony");
    expect(json.data.phoneNumber).toBe("+91 78420 97842");
    expect(json.data.isContactVerified).toBe(true);
  });

  it("PATCH /api/admin/settings validates required fields", async () => {
    const { PATCH: patchSettingsHandler } = await import("@/app/api/admin/settings/route");
    const invalidRequest = new Request("http://localhost:3000/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessNameEn: "",
        contactEmail: "invalid-email",
      }),
    });

    const response = await patchSettingsHandler(invalidRequest);
    expect(response.status).toBe(400);

    const json = (await response.json()) as { ok: boolean; error: { code: string } };
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("PATCH /api/admin/settings updates settings and creates a content revision", async () => {
    const { PATCH: patchSettingsHandler } = await import("@/app/api/admin/settings/route");
    const updatePayload = {
      ...DEFAULT_SITE_SETTINGS,
      businessNameEn: "Capital Chowdary Matrimony Updated",
      whatsappNumber: "+91 99999 88888",
      isContactVerified: true,
    };

    const request = new Request("http://localhost:3000/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatePayload),
    });

    const response = await patchSettingsHandler(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      ok: boolean;
      data: { businessNameEn: string; whatsappNumber: string };
    };
    expect(json.ok).toBe(true);
    expect(json.data.businessNameEn).toBe("Capital Chowdary Matrimony Updated");
    expect(json.data.whatsappNumber).toBe("+91 99999 88888");

    // Verify DB persistence
    const [persisted] = await activeTestDb
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);
    expect(persisted?.businessNameEn).toBe("Capital Chowdary Matrimony Updated");
    expect(persisted?.whatsappNumber).toBe("+91 99999 88888");

    // Verify content revision audit trail
    const revisions = await activeTestDb
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.entityType, "site_settings"));
    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.action).toBe("update");
    expect(revisions[0]?.changedByAdminId).toBe("admin-test-id");
  });
});
