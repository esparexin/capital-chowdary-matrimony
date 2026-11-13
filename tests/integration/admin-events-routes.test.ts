import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { adminUsers, contentRevisions, marriageEvents, mediaAssets } from "@/db/schema";
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

describe("admin marriage events API routes", () => {
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

  it("GET /api/admin/events returns list of events with cover assets", async () => {
    const mediaId = "media-ev-1";
    await activeTestDb.insert(mediaAssets).values({
      id: mediaId,
      cloudinaryPublicId: "ccm/events/sample-event-cover",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      resourceType: "image",
      format: "jpg",
      width: 1200,
      height: 800,
      uploadedByAdminId: "admin-test-id",
    });

    await activeTestDb.insert(marriageEvents).values({
      id: "event-1",
      slug: "parichaya-vedika-2026",
      titleEn: "Parichaya Vedika 2026",
      titleTe: "పరిచయ వేదిక 2026",
      locationEn: "Narasaraopet",
      locationTe: "నరసరావుపేట",
      eventDate: "2026-12-15",
      coverMediaAssetId: mediaId,
      sortOrder: 1,
      status: "published",
    });

    const { GET: getEventsHandler } = await import("@/app/api/admin/events/route");
    const response = await getEventsHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: Array<{ titleEn: string; coverUrl: string }> };
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]?.titleEn).toBe("Parichaya Vedika 2026");
    expect(json.data[0]?.coverUrl).toBe("https://res.cloudinary.com/demo/image/upload/sample.jpg");
  });

  it("POST /api/admin/events creates an event with Cloudinary cover and revision", async () => {
    const { POST: postEventHandler } = await import("@/app/api/admin/events/route");
    const payload = {
      slug: "guntur-meet-2026",
      titleEn: "Guntur Matrimonial Meet",
      titleTe: "గుంటూరు వివాహ వేదిక",
      locationEn: "Guntur",
      locationTe: "గుంటూరు",
      eventDate: "2026-11-25",
      sortOrder: 2,
      status: "published",
      cloudinaryPublicId: "ccm/events/guntur-cover",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/guntur.jpg",
      width: 1200,
      height: 800,
      format: "jpg",
    };

    const request = new Request("http://localhost:3000/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await postEventHandler(request);
    expect(response.status).toBe(201);

    const json = (await response.json()) as { ok: boolean; data: { id: string; coverUrl: string } };
    expect(json.ok).toBe(true);
    expect(json.data.coverUrl).toBe("https://res.cloudinary.com/demo/image/upload/guntur.jpg");

    // Check media record was created
    const mediaRows = await activeTestDb
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.cloudinaryPublicId, "ccm/events/guntur-cover"));
    expect(mediaRows).toHaveLength(1);

    // Check revision
    const revisions = await activeTestDb
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.entityType, "marriage_event"));
    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.action).toBe("create");
  });

  it("PATCH /api/admin/events/[id] toggles status to published and updates publishedAt", async () => {
    await activeTestDb.insert(marriageEvents).values({
      id: "ev-to-toggle",
      slug: "toggle-ev",
      titleEn: "Toggle Event",
      titleTe: "టాగుల్",
      sortOrder: 1,
      status: "draft",
    });

    const { PATCH: patchEventHandler } = await import("@/app/api/admin/events/[id]/route");
    const request = new Request("http://localhost:3000/api/admin/events/ev-to-toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });

    const response = await patchEventHandler(request, {
      params: Promise.resolve({ id: "ev-to-toggle" }),
    });
    expect(response.status).toBe(200);

    const [updated] = await activeTestDb
      .select()
      .from(marriageEvents)
      .where(eq(marriageEvents.id, "ev-to-toggle"));
    expect(updated?.status).toBe("published");
    expect(updated?.publishedAt).not.toBeNull();
  });

  it("DELETE /api/admin/events/[id] cleans up Cloudinary asset and deletes records", async () => {
    const { deleteCloudinaryAsset } = await import("@/lib/cloudinary/cloudinary-destroy");

    const mediaId = "media-ev-del";
    await activeTestDb.insert(mediaAssets).values({
      id: mediaId,
      cloudinaryPublicId: "ccm/events/delete-cover",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/delete-cover.jpg",
      resourceType: "image",
      format: "jpg",
      uploadedByAdminId: "admin-test-id",
    });

    await activeTestDb.insert(marriageEvents).values({
      id: "ev-to-delete",
      slug: "delete-me",
      titleEn: "Delete Event",
      titleTe: "డిలీట్",
      coverMediaAssetId: mediaId,
      sortOrder: 1,
      status: "draft",
    });

    const { DELETE: deleteEventHandler } = await import("@/app/api/admin/events/[id]/route");
    const request = new Request("http://localhost:3000/api/admin/events/ev-to-delete", {
      method: "DELETE",
    });

    const response = await deleteEventHandler(request, {
      params: Promise.resolve({ id: "ev-to-delete" }),
    });
    expect(response.status).toBe(200);

    expect(deleteCloudinaryAsset).toHaveBeenCalledWith("ccm/events/delete-cover");

    const [deletedEvent] = await activeTestDb
      .select()
      .from(marriageEvents)
      .where(eq(marriageEvents.id, "ev-to-delete"));
    expect(deletedEvent).toBeUndefined();

    const [deletedMedia] = await activeTestDb
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, mediaId));
    expect(deletedMedia).toBeUndefined();
  });
});
