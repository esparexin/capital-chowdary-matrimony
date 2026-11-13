"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Upload } from "lucide-react";
import type { AdminGalleryItemRecord } from "@/app/api/admin/gallery/route";
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

interface AdminGalleryUploadFormProps {
  onUploadSuccess: (item: AdminGalleryItemRecord) => void;
  onError: (error: string | null) => void;
  onSuccess: (message: string | null) => void;
}

export function AdminGalleryUploadForm({
  onUploadSuccess,
  onError,
  onSuccess,
}: AdminGalleryUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [captionEn, setCaptionEn] = useState("");
  const [captionTe, setCaptionTe] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      onError("Please select a JPEG, PNG, or WebP image.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      onError("Image file must be under 5MB.");
      return;
    }

    onError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError("Please select an image file to upload.");
      return;
    }

    setIsUploading(true);
    onError(null);
    onSuccess(null);

    try {
      const sigRes = await fetch("/api/admin/media/signature?category=gallery", {
        method: "POST",
      });
      const sigJson = (await sigRes.json()) as ApiResponse<CloudinarySignedUploadParams>;

      if (!sigRes.ok || !sigJson.ok) {
        throw new Error(
          !sigJson.ok ? sigJson.error.message : "Failed to obtain upload authorization.",
        );
      }

      const { cloudName, apiKey, folder, timestamp, signature } = sigJson.data;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const cldJson = (await cldRes.json()) as CloudinaryUploadResponse;

      if (!cldRes.ok) {
        throw new Error(cldJson.error?.message || "Cloudinary upload failed.");
      }

      const saveRes = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloudinaryPublicId: cldJson.public_id,
          secureUrl: cldJson.secure_url,
          width: cldJson.width,
          height: cldJson.height,
          bytes: cldJson.bytes,
          format: cldJson.format,
          captionEn,
          captionTe,
          status,
        }),
      });
      const saveJson = (await saveRes.json()) as ApiResponse<AdminGalleryItemRecord>;

      if (!saveRes.ok || !saveJson.ok) {
        throw new Error(
          !saveJson.ok ? saveJson.error.message : "Failed to save image record in database.",
        );
      }

      onUploadSuccess(saveJson.data);
      setFile(null);
      setPreviewUrl(null);
      setCaptionEn("");
      setCaptionTe("");
      onSuccess("Gallery image uploaded and saved successfully.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h2 className="text-base font-semibold text-foreground">Upload Gallery Image</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        JPEG, PNG, or WebP up to 5MB. Uploads securely to Cloudinary.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label htmlFor="gallery-file" className="block text-xs font-medium text-foreground">
              Select File
            </label>
            <input
              id="gallery-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground hover:file:opacity-90"
            />
          </div>
          <div>
            <label htmlFor="caption-en" className="block text-xs font-medium text-foreground">
              Caption (English)
            </label>
            <input
              id="caption-en"
              type="text"
              value={captionEn}
              onChange={(e) => setCaptionEn(e.target.value)}
              placeholder="e.g. Marriage Event or Muhurtham Chart"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="caption-te" className="block text-xs font-medium text-foreground">
              Caption (Telugu)
            </label>
            <input
              id="caption-te"
              type="text"
              value={captionTe}
              onChange={(e) => setCaptionTe(e.target.value)}
              placeholder="ఉదా: వివాహ వేడుక లేదా ముహూర్తం వివరాలు"
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-3">
          {previewUrl ? (
            <div className="relative aspect-4/3 w-full max-w-[200px] overflow-hidden rounded-md bg-black/5">
              <Image src={previewUrl} alt="Upload preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="text-center text-xs text-muted-foreground">
              <Upload className="mx-auto size-6 text-muted-foreground/60" />
              <p className="mt-1">No image selected</p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-3">
            <label htmlFor="gallery-status" className="text-xs font-medium text-foreground">
              Visibility:
            </label>
            <select
              id="gallery-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "published" | "draft")}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isUploading || !file}
        className="mt-4 inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        <span>{isUploading ? "Uploading to Cloudinary..." : "Upload to Gallery"}</span>
      </button>
    </form>
  );
}
