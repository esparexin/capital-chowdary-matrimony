import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { adminUsers, contentRevisions, services } from "@/db/schema";
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

describe("admin services API routes", () => {
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
  });

  it("GET /api/admin/services returns list of services", async () => {
    await activeTestDb.insert(services).values({
      id: "svc-1",
      slug: "software-profiles",
      titleEn: "Software Profiles",
      titleTe: "సాఫ్ట్‌వేర్ సంబంధాలు",
      descriptionEn: "Alliances for engineers",
      descriptionTe: "ఇంజనీర్ల సంబంధాలు",
      iconName: "HeartHandshake",
      sortOrder: 1,
      status: "published",
    });

    const { GET: getServicesHandler } = await import("@/app/api/admin/services/route");
    const response = await getServicesHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: unknown[] };
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
  });

  it("POST /api/admin/services creates a service with revision", async () => {
    const { POST: postServiceHandler } = await import("@/app/api/admin/services/route");
    const payload = {
      slug: "doctors-alliances",
      titleEn: "Doctors Alliances",
      titleTe: "డాక్టర్ల సంబంధాలు",
      descriptionEn: "MBBS & MD alliances",
      descriptionTe: "ఎంబీబీఎస్ సంబంధాలు",
      iconName: "Users",
      sortOrder: 2,
      status: "published",
    };

    const request = new Request("http://localhost:3000/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await postServiceHandler(request);
    expect(response.status).toBe(201);

    const json = (await response.json()) as { ok: boolean; data: { id: string; slug: string } };
    expect(json.ok).toBe(true);
    expect(json.data.slug).toBe("doctors-alliances");

    // Check revision
    const revisions = await activeTestDb
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.entityType, "service"));
    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.action).toBe("create");
  });

  it("PATCH /api/admin/services/[id] updates status and publication timestamp", async () => {
    await activeTestDb.insert(services).values({
      id: "svc-to-update",
      slug: "test-svc",
      titleEn: "Test Svc",
      titleTe: "టెస్ట్",
      descriptionEn: "Test desc",
      descriptionTe: "టెస్ట్ వివరణ",
      iconName: "HeartHandshake",
      sortOrder: 1,
      status: "draft",
    });

    const { PATCH: patchServiceHandler } = await import("@/app/api/admin/services/[id]/route");
    const request = new Request("http://localhost:3000/api/admin/services/svc-to-update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });

    const response = await patchServiceHandler(request, {
      params: Promise.resolve({ id: "svc-to-update" }),
    });
    expect(response.status).toBe(200);

    const [updated] = await activeTestDb
      .select()
      .from(services)
      .where(eq(services.id, "svc-to-update"));
    expect(updated?.status).toBe("published");
    expect(updated?.publishedAt).not.toBeNull();
  });

  it("DELETE /api/admin/services/[id] removes service and logs revision", async () => {
    await activeTestDb.insert(services).values({
      id: "svc-to-delete",
      slug: "del-svc",
      titleEn: "Delete Me",
      titleTe: "డిలీట్",
      descriptionEn: "Delete desc",
      descriptionTe: "వివరణ",
      iconName: "HeartHandshake",
      sortOrder: 1,
      status: "draft",
    });

    const { DELETE: deleteServiceHandler } = await import("@/app/api/admin/services/[id]/route");
    const request = new Request("http://localhost:3000/api/admin/services/svc-to-delete", {
      method: "DELETE",
    });

    const response = await deleteServiceHandler(request, {
      params: Promise.resolve({ id: "svc-to-delete" }),
    });
    expect(response.status).toBe(200);

    const [deleted] = await activeTestDb
      .select()
      .from(services)
      .where(eq(services.id, "svc-to-delete"));
    expect(deleted).toBeUndefined();
  });
});
