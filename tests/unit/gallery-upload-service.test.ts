import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  executeGalleryBatchUpload,
  type GalleryUploadQueueItem,
} from "@/components/admin/gallery/gallery-upload-service";

describe("gallery-upload-service batch processing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("successfully uploads a batch of items sequentially and updates progress", async () => {
    // Mock signature endpoint
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/admin/media/signature")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                cloudName: "mock-cloud",
                apiKey: "mock-key",
                folder: "ccm/gallery",
                timestamp: 123456,
                signature: "mock-sig",
              },
            }),
        });
      }

      if (url.includes("api.cloudinary.com")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              public_id: "cld-id-1",
              secure_url: "https://res.cloudinary.com/mock-cloud/image/upload/sample.jpg",
              width: 1000,
              height: 800,
            }),
        });
      }

      if (url.includes("/api/admin/gallery")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                id: "gallery-saved-1",
                mediaAssetId: "media-1",
                captionEn: "Test",
              },
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    const file1 = new File(["dummy1"], "pic1.jpg", { type: "image/jpeg" });
    const file2 = new File(["dummy2"], "pic2.jpg", { type: "image/jpeg" });

    const items: GalleryUploadQueueItem[] = [
      {
        id: "item-1",
        file: file1,
        previewUrl: "blob:1",
        captionEn: "Photo 1",
        captionTe: "ఫోటో 1",
        status: "idle",
      },
      {
        id: "item-2",
        file: file2,
        previewUrl: "blob:2",
        captionEn: "Photo 2",
        captionTe: "ఫోటో 2",
        status: "idle",
      },
    ];

    const statusHistory: Array<{ id: string; status: string }> = [];
    const savedRecords: unknown[] = [];

    const summary = await executeGalleryBatchUpload(items, {
      status: "published",
      onItemStatusChange: (id, status) => {
        statusHistory.push({ id, status });
      },
      onItemSuccess: (saved) => {
        savedRecords.push(saved);
      },
    });

    expect(summary.total).toBe(2);
    expect(summary.succeeded).toBe(2);
    expect(summary.failed).toBe(0);
    expect(savedRecords).toHaveLength(2);
    expect(statusHistory.filter((s) => s.status === "success")).toHaveLength(2);
  });

  it("handles partial failure without dropping previously succeeded items", async () => {
    let callIndex = 0;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/admin/media/signature")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                cloudName: "mock-cloud",
                apiKey: "mock-key",
                folder: "ccm/gallery",
                timestamp: 123456,
                signature: "mock-sig",
              },
            }),
        });
      }

      if (url.includes("api.cloudinary.com")) {
        callIndex++;
        if (callIndex === 2) {
          // Second upload fails
          return Promise.resolve({
            ok: false,
            json: () =>
              Promise.resolve({ error: { message: "Cloudinary storage quota exceeded" } }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              public_id: `cld-${callIndex}`,
              secure_url: `https://res.cloudinary.com/mock-cloud/image/upload/sample-${callIndex}.jpg`,
              width: 800,
              height: 600,
            }),
        });
      }

      if (url.includes("/api/admin/gallery")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: { id: `gallery-${callIndex}` },
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    const items: GalleryUploadQueueItem[] = [
      {
        id: "it-1",
        file: new File(["1"], "1.jpg", { type: "image/jpeg" }),
        previewUrl: "blob:1",
        captionEn: "One",
        captionTe: "",
        status: "idle",
      },
      {
        id: "it-2",
        file: new File(["2"], "2.jpg", { type: "image/jpeg" }),
        previewUrl: "blob:2",
        captionEn: "Two",
        captionTe: "",
        status: "idle",
      },
      {
        id: "it-3",
        file: new File(["3"], "3.jpg", { type: "image/jpeg" }),
        previewUrl: "blob:3",
        captionEn: "Three",
        captionTe: "",
        status: "idle",
      },
    ];

    const succeededItems: string[] = [];
    const failedItems: string[] = [];

    const summary = await executeGalleryBatchUpload(items, {
      status: "published",
      onItemStatusChange: (id, status) => {
        if (status === "success") succeededItems.push(id);
        if (status === "error") failedItems.push(id);
      },
      onItemSuccess: () => {},
    });

    expect(summary.total).toBe(3);
    expect(summary.succeeded).toBe(2);
    expect(summary.failed).toBe(1);
    expect(succeededItems).toEqual(["it-1", "it-3"]);
    expect(failedItems).toEqual(["it-2"]);
  });
});
