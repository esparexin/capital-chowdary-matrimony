import type { AdminGalleryItemRecord } from "@/app/api/admin/gallery/route";
import type { CloudinarySignedUploadParams } from "@/lib/cloudinary/cloudinary-signature";
import type { ApiResponse } from "@/types/api-response";

export type UploadItemStatus = "idle" | "uploading" | "success" | "error";

export interface GalleryUploadQueueItem {
  id: string;
  file: File;
  previewUrl: string;
  captionEn: string;
  captionTe: string;
  status: UploadItemStatus;
  errorMessage?: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes?: number;
  format?: string;
  error?: { message?: string };
}

export interface BatchUploadSummary {
  total: number;
  succeeded: number;
  failed: number;
}

export async function fetchUploadSignature(
  category: "gallery" | "events" = "gallery",
): Promise<CloudinarySignedUploadParams> {
  const res = await fetch(`/api/admin/media/signature?category=${category}`, {
    method: "POST",
  });
  const json = (await res.json()) as ApiResponse<CloudinarySignedUploadParams>;
  if (!res.ok || !json.ok) {
    throw new Error(!json.ok ? json.error.message : "Failed to obtain upload authorization.");
  }
  return json.data;
}

export async function uploadFileToCloudinary(
  file: File,
  sig: CloudinarySignedUploadParams,
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const json = (await res.json()) as CloudinaryUploadResult;
  if (!res.ok || json.error) {
    throw new Error(json.error?.message || "Cloudinary upload failed.");
  }

  return json;
}

export async function persistGalleryRecord(
  cld: CloudinaryUploadResult,
  meta: {
    captionEn: string;
    captionTe: string;
    eventId?: string;
    status: "published" | "draft";
  },
): Promise<AdminGalleryItemRecord> {
  const res = await fetch("/api/admin/gallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cloudinaryPublicId: cld.public_id,
      secureUrl: cld.secure_url,
      width: cld.width,
      height: cld.height,
      bytes: cld.bytes,
      format: cld.format,
      captionEn: meta.captionEn,
      captionTe: meta.captionTe,
      eventId: meta.eventId || undefined,
      status: meta.status,
    }),
  });

  const json = (await res.json()) as ApiResponse<AdminGalleryItemRecord>;
  if (!res.ok || !json.ok) {
    throw new Error(!json.ok ? json.error.message : "Failed to persist gallery item in database.");
  }

  return json.data;
}

export async function executeGalleryBatchUpload(
  items: GalleryUploadQueueItem[],
  options: {
    eventId?: string;
    status: "published" | "draft";
    onItemStatusChange: (id: string, status: UploadItemStatus, error?: string) => void;
    onItemSuccess: (saved: AdminGalleryItemRecord) => void;
  },
): Promise<BatchUploadSummary> {
  const pendingItems = items.filter((it) => it.status !== "success");
  let succeeded = 0;
  let failed = 0;

  let signature: CloudinarySignedUploadParams | null = null;
  try {
    signature = await fetchUploadSignature("gallery");
  } catch (sigErr) {
    const errorMsg = sigErr instanceof Error ? sigErr.message : "Signature failed.";
    for (const it of pendingItems) {
      options.onItemStatusChange(it.id, "error", errorMsg);
    }
    return { total: pendingItems.length, succeeded: 0, failed: pendingItems.length };
  }

  for (const item of pendingItems) {
    options.onItemStatusChange(item.id, "uploading");
    try {
      const cld = await uploadFileToCloudinary(item.file, signature);
      const saved = await persistGalleryRecord(cld, {
        captionEn: item.captionEn,
        captionTe: item.captionTe,
        eventId: options.eventId,
        status: options.status,
      });

      options.onItemStatusChange(item.id, "success");
      options.onItemSuccess(saved);
      succeeded++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      options.onItemStatusChange(item.id, "error", msg);
      failed++;
    }
  }

  return { total: pendingItems.length, succeeded, failed };
}
