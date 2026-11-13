import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@/db";
import { adminUsers, galleryItems, mediaAssets } from "@/db/schema";
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

vi.mock("@/lib/cloudinary/cloudinary-signature", () => ({
  createCloudinaryUploadSignature: vi.fn().mockResolvedValue({
    cloudName: "demo-cloud",
    apiKey: "demo-api-key",
    folder: "capital-chowdary-matrimony/gallery",
    timestamp: 1700000000,
    signature: "demo-sha1-signature",
  }),
}));

vi.mock("@/lib/cloudinary/cloudinary-destroy", () => ({
  deleteCloudinaryAsset: vi.fn().mockResolvedValue({ result: "ok" }),
}));

describe("admin gallery API routes", () => {
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

  it("POST /api/admin/gallery/signature returns signed upload parameters", async () => {
    const { POST: signatureHandler } = await import("@/app/api/admin/gallery/signature/route");
    const response = await signatureHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      ok: boolean;
      data: { cloudName: string; apiKey: string; signature: string };
    };
    expect(json.ok).toBe(true);
    expect(json.data.cloudName).toBe("demo-cloud");
    expect(json.data.signature).toBe("demo-sha1-signature");
  });

  it("POST /api/admin/media/signature returns signed upload parameters with category", async () => {
    const { POST: mediaSignatureHandler } = await import("@/app/api/admin/media/signature/route");
    const req = new Request("http://localhost:3000/api/admin/media/signature?category=events", {
      method: "POST",
    });
    const response = await mediaSignatureHandler(req);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      ok: boolean;
      data: { cloudName: string; apiKey: string; signature: string };
    };
    expect(json.ok).toBe(true);
    expect(json.data.cloudName).toBe("demo-cloud");
    expect(json.data.signature).toBe("demo-sha1-signature");
  });

  it("GET /api/admin/gallery returns empty list when no items exist", async () => {
    const { GET: getGalleryHandler } = await import("@/app/api/admin/gallery/route");
    const response = await getGalleryHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: unknown[] };
    expect(json.ok).toBe(true);
    expect(json.data).toEqual([]);
  });

  it("POST /api/admin/gallery creates an item and GET retrieves it", async () => {
    const { POST: postGalleryHandler, GET: getGalleryHandler } =
      await import("@/app/api/admin/gallery/route");

    const createPayload = {
      cloudinaryPublicId: "ccm/wedding-sample-1",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      width: 1200,
      height: 900,
      format: "jpg",
      captionEn: "Traditional Ceremony",
      captionTe: "సాంప్రదాయ వివాహ వేడుక",
      status: "published" as const,
    };

    const postReq = new Request("http://localhost:3000/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createPayload),
    });

    const createRes = await postGalleryHandler(postReq);
    expect(createRes.status).toBe(201);
    const createJson = (await createRes.json()) as {
      ok: boolean;
      data: { id: string; captionEn: string; status: string };
    };
    expect(createJson.ok).toBe(true);
    expect(createJson.data.captionEn).toBe("Traditional Ceremony");
    expect(createJson.data.status).toBe("published");

    const getRes = await getGalleryHandler();
    const getJson = (await getRes.json()) as {
      ok: boolean;
      data: Array<{ id: string; secureUrl: string; captionTe: string }>;
    };
    expect(getJson.ok).toBe(true);
    expect(getJson.data).toHaveLength(1);
    expect(getJson.data[0]?.captionTe).toBe("సాంప్రదాయ వివాహ వేడుక");
  });

  it("PATCH /api/admin/gallery/[id] updates visibility and DELETE removes the record", async () => {
    const { PATCH: patchHandler, DELETE: deleteHandler } =
      await import("@/app/api/admin/gallery/[id]/route");

    const mediaId = "media-1";
    const galleryId = "gallery-item-1";
    const now = new Date().toISOString();

    await activeTestDb.insert(mediaAssets).values({
      id: mediaId,
      cloudinaryPublicId: "ccm/test-asset",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/test.jpg",
      resourceType: "image",
      format: "jpg",
      width: 800,
      height: 600,
      createdAt: now,
    });

    await activeTestDb.insert(galleryItems).values({
      id: galleryId,
      mediaAssetId: mediaId,
      captionEn: "Initial English",
      captionTe: "ప్రారంభ వివరణ",
      sortOrder: 1,
      status: "published",
      publishedAt: now,
      createdAt: now,
    });

    // PATCH status to draft and update captions
    const patchReq = new Request(`http://localhost:3000/api/admin/gallery/${galleryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "draft",
        captionEn: "Updated Ceremony",
        captionTe: "నవీకరించబడిన వేడుక",
      }),
    });

    const patchRes = await patchHandler(patchReq, {
      params: Promise.resolve({ id: galleryId }),
    });
    expect(patchRes.status).toBe(200);

    // DELETE item
    const deleteReq = new Request(`http://localhost:3000/api/admin/gallery/${galleryId}`, {
      method: "DELETE",
    });
    const deleteRes = await deleteHandler(deleteReq, {
      params: Promise.resolve({ id: galleryId }),
    });
    expect(deleteRes.status).toBe(200);

    const { deleteCloudinaryAsset } = await import("@/lib/cloudinary/cloudinary-destroy");
    expect(deleteCloudinaryAsset).toHaveBeenCalledWith("ccm/test-asset");

    // Verify it is gone
    const { GET: getGalleryHandler } = await import("@/app/api/admin/gallery/route");
    const getRes = await getGalleryHandler();
    const getJson = (await getRes.json()) as { ok: boolean; data: unknown[] };
    expect(getJson.data).toHaveLength(0);
  });
});
