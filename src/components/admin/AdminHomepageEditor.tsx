"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import type { AdminHomepageHeroData } from "@/app/api/admin/homepage/route";
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
      let cloudinaryData: Partial<CloudinaryUploadResponse> = {};

      if (bannerFile) {
        const sigRes = await fetch("/api/admin/media/signature?category=banners", {
          method: "POST",
        });
        const sigJson = (await sigRes.json()) as ApiResponse<CloudinarySignedUploadParams>;

        if (!sigRes.ok || !sigJson.ok) {
          throw new Error(
            !sigJson.ok ? sigJson.error.message : "Failed to obtain upload authorization.",
          );
        }

        const { cloudName, apiKey, folder, timestamp, signature } = sigJson.data;
        const uploadBody = new FormData();
        uploadBody.append("file", bannerFile);
        uploadBody.append("api_key", apiKey);
        uploadBody.append("timestamp", String(timestamp));
        uploadBody.append("signature", signature);
        uploadBody.append("folder", folder);

        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: uploadBody,
        });
        const cldJson = (await cldRes.json()) as CloudinaryUploadResponse;

        if (!cldRes.ok) {
          throw new Error(cldJson.error?.message || "Cloudinary banner upload failed.");
        }

        cloudinaryData = cldJson;
      }

      const payload = {
        ...formData,
        highlights: highlights.filter((h) => h.title.trim() && h.description.trim()),
        ...(cloudinaryData.public_id
          ? {
              cloudinaryPublicId: cloudinaryData.public_id,
              secureUrl: cloudinaryData.secure_url,
              width: cloudinaryData.width,
              height: cloudinaryData.height,
              bytes: cloudinaryData.bytes,
              format: cloudinaryData.format,
            }
          : {}),
      };

      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse<AdminHomepageHeroData>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to save homepage hero.");
      }

      setBannerFile(null);
      if (json.data.bannerUrl) {
        setBannerPreviewUrl(json.data.bannerUrl);
      }
      setSuccessMessage("Homepage hero content saved successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save homepage content.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
        >
          <AlertCircle className="size-4 shrink-0" />
          <p className="flex-1 font-medium">{errorMessage}</p>
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <p className="flex-1 font-medium">{successMessage}</p>
        </div>
      ) : null}

      {/* 1. Hero Copy (Bilingual) */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Hero Heading &amp; Introduction
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Topmost heading, verified Telugu introduction banner, and primary description on the
            public homepage.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="hero-title-en" className="block text-xs font-medium text-foreground">
              Main Heading (English)
            </label>
            <input
              id="hero-title-en"
              type="text"
              required
              value={formData.titleEn}
              onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="hero-title-te" className="block text-xs font-medium text-foreground">
              Telugu Introduction Banner
            </label>
            <textarea
              id="hero-title-te"
              rows={2}
              required
              value={formData.titleTe}
              onChange={(e) => setFormData((p) => ({ ...p, titleTe: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="hero-body-en" className="block text-xs font-medium text-foreground">
              Description (English)
            </label>
            <textarea
              id="hero-body-en"
              rows={3}
              required
              value={formData.bodyEn}
              onChange={(e) => setFormData((p) => ({ ...p, bodyEn: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* 2. Association & Calls to Action */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Association Details &amp; Calls to Action
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Welfare association affiliation details and hero button configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="assoc-name" className="block text-xs font-medium text-foreground">
              Association Name
            </label>
            <input
              id="assoc-name"
              type="text"
              required
              value={formData.associationName}
              onChange={(e) => setFormData((p) => ({ ...p, associationName: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="assoc-detail" className="block text-xs font-medium text-foreground">
              Association Registration Details
            </label>
            <input
              id="assoc-detail"
              type="text"
              required
              value={formData.associationDetail}
              onChange={(e) => setFormData((p) => ({ ...p, associationDetail: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="primary-cta-label"
              className="block text-xs font-medium text-foreground"
            >
              Primary Button Label
            </label>
            <input
              id="primary-cta-label"
              type="text"
              required
              value={formData.primaryCtaLabelEn}
              onChange={(e) => setFormData((p) => ({ ...p, primaryCtaLabelEn: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="primary-cta-href" className="block text-xs font-medium text-foreground">
              Primary Button URL
            </label>
            <input
              id="primary-cta-href"
              type="text"
              required
              value={formData.primaryCtaHref}
              onChange={(e) => setFormData((p) => ({ ...p, primaryCtaHref: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="secondary-cta-label"
              className="block text-xs font-medium text-foreground"
            >
              Secondary Button Label
            </label>
            <input
              id="secondary-cta-label"
              type="text"
              required
              value={formData.secondaryCtaLabelEn}
              onChange={(e) => setFormData((p) => ({ ...p, secondaryCtaLabelEn: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="secondary-cta-href"
              className="block text-xs font-medium text-foreground"
            >
              Secondary Button URL
            </label>
            <input
              id="secondary-cta-href"
              type="text"
              required
              value={formData.secondaryCtaHref}
              onChange={(e) => setFormData((p) => ({ ...p, secondaryCtaHref: e.target.value }))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* 3. Hero Highlights */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Hero Highlights
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Key alliance points shown under the hero heading (e.g. geographic coverage).
            </p>
          </div>
          <button
            type="button"
            onClick={addHighlight}
            className="inline-flex items-center gap-1 rounded border border-input px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Plus className="size-3.5" />
            Add Highlight
          </button>
        </div>

        <div className="space-y-3">
          {highlights.map((hl, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="flex-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground">
                    Highlight Title
                  </label>
                  <input
                    type="text"
                    value={hl.title}
                    onChange={(e) => handleHighlightChange(idx, "title", e.target.value)}
                    placeholder="e.g. Andhra Pradesh & Telangana"
                    className="mt-0.5 block w-full rounded border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground">
                    Highlight Description
                  </label>
                  <input
                    type="text"
                    value={hl.description}
                    onChange={(e) => handleHighlightChange(idx, "description", e.target.value)}
                    placeholder="e.g. Alliances across both Telugu states"
                    className="mt-0.5 block w-full rounded border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeHighlight(idx)}
                className="mt-4 rounded p-1 text-destructive hover:bg-destructive/10"
                title="Remove highlight"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Banner Image & Publication Status */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Banner Media &amp; Status
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Hero banner photo stored on Cloudinary and public publication toggle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hero-status" className="block text-xs font-medium text-foreground">
              Hero Section Visibility
            </label>
            <select
              id="hero-status"
              value={formData.status}
              onChange={(e) =>
                setFormData((p) => ({ ...p, status: e.target.value as "draft" | "published" }))
              }
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <option value="published">Published (Live on Website)</option>
              <option value="draft">Draft (Fallback to Baseline Defaults)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-foreground">
              Hero Banner Image (Cloudinary)
            </label>

            <div className="mt-2 flex flex-wrap items-center gap-4">
              {bannerPreviewUrl ? (
                <div className="relative aspect-16/10 w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src={bannerPreviewUrl}
                    alt="Hero banner preview"
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setBannerFile(null);
                      setBannerPreviewUrl(null);
                    }}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div className="flex aspect-16/10 w-44 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                  <ImageIcon className="size-8 stroke-1" />
                </div>
              )}

              <div className="flex-1">
                <input
                  id="hero-banner-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/80"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Uploads directly to Cloudinary folder <span className="font-mono">banners</span>.
                  Recommended size: 1200x896px. Max 5MB.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Save Button */}
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
