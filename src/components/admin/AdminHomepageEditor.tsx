"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import type { AdminHomepageHeroData } from "@/app/api/admin/homepage/route";
import type { CloudinarySignedUploadParams } from "@/lib/cloudinary/cloudinary-signature";
import type { ApiResponse } from "@/types/api-response";
import { HomepageHeroContentSection } from "@/components/admin/homepage/HomepageHeroContentSection";
import { HomepageHeroHighlightsSection } from "@/components/admin/homepage/HomepageHeroHighlightsSection";
import { HomepageHeroBannerSection } from "@/components/admin/homepage/HomepageHeroBannerSection";

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes?: number;
  format?: string;
  error?: { message?: string };
}

interface AdminHomepageEditorProps {
  initialData: AdminHomepageHeroData;
}

export function AdminHomepageEditor({ initialData }: AdminHomepageEditorProps) {
  const [formData, setFormData] = useState({
    titleEn: initialData.titleEn,
    titleTe: initialData.titleTe,
    bodyEn: initialData.bodyEn,
    primaryCtaLabelEn: initialData.primaryCtaLabelEn,
    primaryCtaHref: initialData.primaryCtaHref,
    secondaryCtaLabelEn: initialData.secondaryCtaLabelEn,
    secondaryCtaHref: initialData.secondaryCtaHref,
    associationName: initialData.associationName,
    associationDetail: initialData.associationDetail,
    status: initialData.status,
  });

  const [highlights, setHighlights] = useState<Array<{ title: string; description: string }>>(
    initialData.highlights.length > 0
      ? initialData.highlights
      : [
          {
            title: "Andhra Pradesh & Telangana",
            description: "Alliances across both Telugu states",
          },
        ],
  );

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(initialData.bannerUrl);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleHighlightChange = (index: number, field: "title" | "description", val: string) => {
    setHighlights((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)),
    );
  };

  const addHighlight = () => {
    setHighlights((prev) => [...prev, { title: "", description: "" }]);
  };

  const removeHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setErrorMessage("Please select a JPEG, PNG, or WebP image.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMessage("Banner image must be under 5MB.");
      return;
    }

    setErrorMessage(null);
    setBannerFile(selected);
    setBannerPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let uploadedPublicId: string | undefined;
      let uploadedSecureUrl: string | undefined;
      let uploadedWidth: number | undefined;
      let uploadedHeight: number | undefined;
      let uploadedBytes: number | undefined;
      let uploadedFormat: string | undefined;

      if (bannerFile) {
        const sigRes = await fetch("/api/admin/media/signature?category=banners", {
          method: "POST",
        });
        const sigJson = (await sigRes.json()) as ApiResponse<CloudinarySignedUploadParams>;
        if (!sigRes.ok || !sigJson.ok) {
          throw new Error(
            !sigJson.ok ? sigJson.error.message : "Failed to obtain upload signature.",
          );
        }

        const { cloudName, apiKey, folder, timestamp, signature } = sigJson.data;
        const uploadBody = new FormData();
        uploadBody.append("file", bannerFile);
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

        uploadedPublicId = cldJson.public_id;
        uploadedSecureUrl = cldJson.secure_url;
        uploadedWidth = cldJson.width;
        uploadedHeight = cldJson.height;
        uploadedBytes = cldJson.bytes;
        uploadedFormat = cldJson.format;
      }

      const payload = {
        ...formData,
        highlights,
        ...(uploadedSecureUrl && {
          secureUrl: uploadedSecureUrl,
          cloudinaryPublicId: uploadedPublicId,
          width: uploadedWidth,
          height: uploadedHeight,
          bytes: uploadedBytes,
          format: uploadedFormat,
          altEn: formData.titleEn,
        }),
      };

      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse<AdminHomepageHeroData>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update homepage hero.");
      }

      setBannerFile(null);
      if (json.data.bannerUrl) {
        setBannerPreviewUrl(json.data.bannerUrl);
      }
      setSuccessMessage("Homepage hero section updated successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save homepage hero.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <p className="flex-1 font-medium">{successMessage}</p>
        </div>
      )}

      <HomepageHeroContentSection formData={formData} setFormData={setFormData} />

      <HomepageHeroHighlightsSection
        highlights={highlights}
        onHighlightChange={handleHighlightChange}
        onAddHighlight={addHighlight}
        onRemoveHighlight={removeHighlight}
      />

      <HomepageHeroBannerSection
        status={formData.status}
        onStatusChange={(status) => setFormData((p) => ({ ...p, status }))}
        bannerPreviewUrl={bannerPreviewUrl}
        onClearBanner={() => {
          setBannerFile(null);
          setBannerPreviewUrl(null);
        }}
        onFileChange={handleFileChange}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? "Saving Hero Section..." : "Save Hero Section"}
        </button>
      </div>
    </form>
  );
}
