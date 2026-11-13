import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/cloudinary-destroy";
import { createCloudinaryUploadSignature } from "@/lib/cloudinary/cloudinary-signature";
import { buildCloudinaryImageUrl } from "@/lib/cloudinary/cloudinary-url";

describe("cloudinary utilities", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds transformed Cloudinary delivery URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "ccm-demo");

    const url = buildCloudinaryImageUrl("/events/ceremony.jpg", {
      width: 800,
      height: 600,
      crop: "fill",
    });

    expect(url).toBe(
      "https://res.cloudinary.com/ccm-demo/image/upload/w_800,h_600,c_fill,q_auto,f_auto/events/ceremony.jpg",
    );
  });

  it("creates deterministic SHA-1 upload signatures with automated subfolder routing", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "ccm-demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "test-secret");
    vi.stubEnv("CLOUDINARY_UPLOAD_FOLDER", "ccm-folder");

    const signed = await createCloudinaryUploadSignature(1700000000);

    expect(signed.cloudName).toBe("ccm-demo");
    expect(signed.apiKey).toBe("test-key");
    expect(signed.folder).toBe("ccm-folder/gallery");
    expect(signed.timestamp).toBe(1700000000);
    expect(signed.signature).toMatch(/^[a-f0-9]{40}$/);

    const eventsSigned = await createCloudinaryUploadSignature("events", 1700000000);
    expect(eventsSigned.folder).toBe("ccm-folder/events");
  });

  it("deletes an asset from Cloudinary via signed destroy API call", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "ccm-demo");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-key");
    vi.stubEnv("CLOUDINARY_API_SECRET", "test-secret");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ result: "ok" }),
    } as Response);

    const res = await deleteCloudinaryAsset("ccm/wedding-sample", 1700000000);
    expect(res.result).toBe("ok");
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.cloudinary.com/v1_1/ccm-demo/image/destroy",
      expect.objectContaining({ method: "POST" }),
    );

    fetchSpy.mockRestore();
  });
});
