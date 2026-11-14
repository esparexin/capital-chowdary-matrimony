import { describe, expect, it, vi, beforeEach } from "vitest";
import { saveMarriageEventWithMedia } from "@/components/admin/events/event-upload-helper";
import type { EventFormData } from "@/components/admin/events/AdminEventForm";

describe("Marriage Event multiple image upload and cover designation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const baseFormData: EventFormData = {
    slug: "vijayawada-sammelan-2026",
    titleEn: "Vijayawada Sammelan",
    titleTe: "విజయవాడ సమ్మేళనం",
    descriptionEn: "Community meeting",
    descriptionTe: "పరిచయ వేదిక",
    locationEn: "Vijayawada",
    locationTe: "విజయవాడ",
    eventDate: "2026-12-20",
    sortOrder: 10,
    status: "published",
  };

  it("handles single cover image upload identically to legacy flow", async () => {
    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/api/admin/media/signature")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                cloudName: "demo-cloud",
                apiKey: "demo-key",
                folder: "ccm/events",
                timestamp: 12345,
                signature: "sig123",
              },
            }),
        });
      }

      if (url.includes("api.cloudinary.com")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              public_id: "ccm/events/single-cover",
              secure_url: "https://res.cloudinary.com/demo-cloud/image/upload/single-cover.jpg",
              width: 1200,
              height: 800,
            }),
        });
      }

      if (url.includes("/api/admin/events")) {
        const body = JSON.parse(init?.body as string);
        expect(body.cloudinaryPublicId).toBe("ccm/events/single-cover");
        expect(body.secureUrl).toBe(
          "https://res.cloudinary.com/demo-cloud/image/upload/single-cover.jpg",
        );
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                id: "ev-saved-1",
                slug: baseFormData.slug,
                coverUrl: body.secureUrl,
              },
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    const coverFile = new File(["dummy-cover"], "cover.jpg", { type: "image/jpeg" });

    const result = await saveMarriageEventWithMedia({
      editingId: null,
      formData: baseFormData,
      selectedFiles: [coverFile],
      coverIndex: 0,
      removeExistingCover: false,
    });

    expect(result.event.id).toBe("ev-saved-1");
    expect(result.event.coverUrl).toBe(
      "https://res.cloudinary.com/demo-cloud/image/upload/single-cover.jpg",
    );
    expect(result.additionalSummary).toBeUndefined();
  });

  it("designates chosen image as cover and uploads remaining to event gallery", async () => {
    const galleryPostBodies: unknown[] = [];

    global.fetch = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/api/admin/media/signature")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                cloudName: "demo-cloud",
                apiKey: "demo-key",
                folder: "ccm/events",
                timestamp: 12345,
                signature: "sig123",
              },
            }),
        });
      }

      if (url.includes("api.cloudinary.com")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              public_id: "ccm/events/uploaded-asset",
              secure_url: "https://res.cloudinary.com/demo-cloud/image/upload/asset.jpg",
              width: 1200,
              height: 800,
            }),
        });
      }

      if (url === "/api/admin/events") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: {
                id: "ev-multi-1",
                slug: baseFormData.slug,
                titleEn: baseFormData.titleEn,
                titleTe: baseFormData.titleTe,
                status: baseFormData.status,
                coverUrl: "https://res.cloudinary.com/demo-cloud/image/upload/asset.jpg",
              },
            }),
        });
      }

      if (url === "/api/admin/gallery") {
        const body = JSON.parse(init?.body as string);
        galleryPostBodies.push(body);
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              ok: true,
              data: { id: `gallery-saved-${galleryPostBodies.length}` },
            }),
        });
      }

      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    const file1 = new File(["1"], "photo-1.jpg", { type: "image/jpeg" });
    const file2 = new File(["2"], "photo-2.jpg", { type: "image/jpeg" });
    const file3 = new File(["3"], "photo-3.jpg", { type: "image/jpeg" });

    // File at index 1 is designated as cover!
    const result = await saveMarriageEventWithMedia({
      editingId: null,
      formData: baseFormData,
      selectedFiles: [file1, file2, file3],
      coverIndex: 1, // file2 is cover
      removeExistingCover: false,
    });

    expect(result.event.id).toBe("ev-multi-1");
    expect(result.additionalSummary).toBeDefined();
    expect(result.additionalSummary?.succeeded).toBe(2); // file1 and file3 added to gallery
    expect(galleryPostBodies).toHaveLength(2);
    expect(galleryPostBodies[0]).toMatchObject({
      eventId: "ev-multi-1",
      captionEn: "Vijayawada Sammelan",
    });
  });
});
