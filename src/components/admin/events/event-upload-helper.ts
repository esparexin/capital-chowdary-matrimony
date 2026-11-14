import type { AdminMarriageEventRecord } from "@/app/api/admin/events/route";
import type { CloudinarySignedUploadParams } from "@/lib/cloudinary/cloudinary-signature";
import type { ApiResponse } from "@/types/api-response";
import type { EventFormData } from "./AdminEventForm";

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

export async function uploadEventGalleryImages(
  files: File[],
  eventId: string,
  eventTitleEn: string,
  eventTitleTe: string,
  status: "draft" | "published",
  onProgress?: (uploadedCount: number, totalCount: number) => void,
): Promise<{ succeeded: number; failed: number }> {
  if (files.length === 0) return { succeeded: 0, failed: 0 };

  const sigRes = await fetch("/api/admin/media/signature?category=events", { method: "POST" });
  const sigJson = (await sigRes.json()) as ApiResponse<CloudinarySignedUploadParams>;
  if (!sigRes.ok || !sigJson.ok) {
    throw new Error("Failed to authorize gallery image upload for event.");
  }

  const { cloudName, apiKey, folder, timestamp, signature } = sigJson.data;
  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    try {
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
        throw new Error(cldJson.error?.message || "Upload failed");
      }

      await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudinaryPublicId: cldJson.public_id,
          secureUrl: cldJson.secure_url,
          width: cldJson.width,
          height: cldJson.height,
          bytes: cldJson.bytes,
          format: cldJson.format,
          captionEn: eventTitleEn,
          captionTe: eventTitleTe,
          eventId,
          status,
        }),
      });

      succeeded++;
      onProgress?.(succeeded, files.length);
    } catch {
      failed++;
    }
  }

  return { succeeded, failed };
}

export async function saveMarriageEventWithMedia(params: {
  editingId: string | null;
  formData: EventFormData;
  selectedFiles: File[];
  coverIndex: number;
  removeExistingCover: boolean;
  onProgress?: (message: string) => void;
}): Promise<{
  event: AdminMarriageEventRecord;
  additionalSummary?: { succeeded: number; failed: number };
}> {
  const { editingId, formData, selectedFiles, coverIndex, removeExistingCover, onProgress } =
    params;
  const isEditing = Boolean(editingId);

  const coverFile = selectedFiles.length > 0 ? selectedFiles[coverIndex] || selectedFiles[0] : null;
  const additionalFiles = selectedFiles.filter((_, idx) => idx !== coverIndex);

  let uploadedMedia: Partial<UploadedEventCover> = {};
  if (coverFile) {
    onProgress?.("Uploading event cover photo to Cloudinary...");
    uploadedMedia = await uploadEventCover(coverFile);
  }

  const payload = {
    ...formData,
    ...(coverFile && uploadedMedia),
    ...(isEditing && removeExistingCover && !coverFile && { removeCover: true }),
  };

  onProgress?.(isEditing ? "Updating event details..." : "Creating event record...");
  const url = isEditing ? `/api/admin/events/${editingId}` : "/api/admin/events";
  const res = await fetch(url, {
    method: isEditing ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as ApiResponse<AdminMarriageEventRecord>;
  if (!res.ok || !json.ok) {
    throw new Error(!json.ok ? json.error.message : "Failed to save marriage event.");
  }

  const savedEvent = json.data;

  let additionalSummary: { succeeded: number; failed: number } | undefined;
  if (additionalFiles.length > 0) {
    onProgress?.(`Uploading ${additionalFiles.length} additional event photo(s)...`);
    additionalSummary = await uploadEventGalleryImages(
      additionalFiles,
      savedEvent.id,
      savedEvent.titleEn,
      savedEvent.titleTe,
      savedEvent.status,
      (done, total) => onProgress?.(`Uploaded photo ${done} of ${total}...`),
    );
  }

  return { event: savedEvent, additionalSummary };
}
