import type { CloudinarySignedUploadParams } from "@/lib/cloudinary/cloudinary-signature";
import type { ApiResponse } from "@/types/api-response";

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes?: number;
  format?: string;
  error?: { message?: string };
}

export interface UploadedEventCover {
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes?: number;
  format?: string;
}

export function validateImageFile(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Please select a JPEG, PNG, or WebP image.";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Cover image must be under 5MB.";
  }
  return null;
}

export async function uploadEventCover(file: File): Promise<UploadedEventCover> {
  const sigRes = await fetch("/api/admin/media/signature?category=events", {
    method: "POST",
  });
  const sigJson = (await sigRes.json()) as ApiResponse<CloudinarySignedUploadParams>;
  if (!sigRes.ok || !sigJson.ok) {
    throw new Error(!sigJson.ok ? sigJson.error.message : "Failed to obtain upload signature.");
  }

  const { cloudName, apiKey, folder, timestamp, signature } = sigJson.data;
  const uploadBody = new FormData();
  uploadBody.append("file", file);
  uploadBody.append("api_key", apiKey);
  uploadBody.append("timestamp", String(timestamp));
  uploadBody.append("signature", signature);
  uploadBody.append("folder", folder);

  const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: uploadBody,
  });
  const cldJson = (await cldRes.json()) as CloudinaryUploadResponse;
  if (!cldRes.ok || cldJson.error) {
    throw new Error(cldJson.error?.message || "Cloudinary image upload failed.");
  }

  return {
    cloudinaryPublicId: cldJson.public_id,
    secureUrl: cldJson.secure_url,
    width: cldJson.width,
    height: cldJson.height,
    bytes: cldJson.bytes,
    format: cldJson.format,
  };
}
