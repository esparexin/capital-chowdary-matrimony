"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import type { ApiResponse } from "@/types/api-response";
import type { SiteSettings } from "@/types/database-types";

interface AdminSettingsFormProps {
  initialSettings: SiteSettings;
}

export function AdminSettingsForm({ initialSettings }: AdminSettingsFormProps) {
  const [formData, setFormData] = useState({
    businessNameEn: initialSettings.businessNameEn,
    businessNameTe: initialSettings.businessNameTe,
    taglineEn: initialSettings.taglineEn,
    taglineTe: initialSettings.taglineTe,
    locationEn: initialSettings.locationEn,
    locationTe: initialSettings.locationTe,
    addressEn: initialSettings.addressEn,
    addressTe: initialSettings.addressTe,
    phoneNumber: initialSettings.phoneNumber,
    whatsappNumber: initialSettings.whatsappNumber,
    contactEmail: initialSettings.contactEmail,
    mapUrl: initialSettings.mapUrl,
    defaultSeoTitleEn: initialSettings.defaultSeoTitleEn,
    defaultSeoTitleTe: initialSettings.defaultSeoTitleTe,
    defaultSeoDescriptionEn: initialSettings.defaultSeoDescriptionEn,
    defaultSeoDescriptionTe: initialSettings.defaultSeoDescriptionTe,
    isContactVerified: initialSettings.isContactVerified,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = (await res.json()) as ApiResponse<SiteSettings>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update site settings.");
      }

      setSuccessMessage("Site settings updated successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
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

      {/* 1. Business Identity */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Business Identity (Bilingual)
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Official name and motto shown across public website headers, footers, and legal notices.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="businessNameEn" className="block text-xs font-medium text-foreground">
              Business Name (English)
            </label>
            <input
              id="businessNameEn"
              name="businessNameEn"
              type="text"
              required
              value={formData.businessNameEn}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="businessNameTe" className="block text-xs font-medium text-foreground">
              Business Name (Telugu)
            </label>
            <input
              id="businessNameTe"
              name="businessNameTe"
              type="text"
              required
              value={formData.businessNameTe}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="taglineEn" className="block text-xs font-medium text-foreground">
              Motto / Tagline (English)
            </label>
            <input
              id="taglineEn"
              name="taglineEn"
              type="text"
              required
              value={formData.taglineEn}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="taglineTe" className="block text-xs font-medium text-foreground">
              Motto / Tagline (Telugu)
            </label>
            <input
              id="taglineTe"
              name="taglineTe"
              type="text"
              required
              value={formData.taglineTe}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* 2. Contact Channels & Office Details */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Office & Contact Channels
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Verified telephone, WhatsApp inquiry channel, email, and Google Maps location.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phoneNumber" className="block text-xs font-medium text-foreground">
              Official Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="whatsappNumber" className="block text-xs font-medium text-foreground">
              Official WhatsApp Number
            </label>
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              type="text"
              required
              value={formData.whatsappNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-xs font-medium text-foreground">
              Contact Email Address
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              value={formData.contactEmail}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="mapUrl" className="block text-xs font-medium text-foreground">
              Google Maps Search / Direction URL
            </label>
            <input
              id="mapUrl"
              name="mapUrl"
              type="url"
              value={formData.mapUrl}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="addressEn" className="block text-xs font-medium text-foreground">
              Office Address (English)
            </label>
            <textarea
              id="addressEn"
              name="addressEn"
              rows={2}
              value={formData.addressEn}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="addressTe" className="block text-xs font-medium text-foreground">
              Office Address (Telugu)
            </label>
            <textarea
              id="addressTe"
              name="addressTe"
              rows={2}
              value={formData.addressTe}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            id="isContactVerified"
            name="isContactVerified"
            type="checkbox"
            checked={formData.isContactVerified}
            onChange={handleChange}
            className="size-4 rounded border-input text-primary focus:ring-primary"
          />
          <label htmlFor="isContactVerified" className="text-xs font-medium text-foreground">
            Mark contact details as verified (enables database overrides on public pages)
          </label>
        </div>
      </section>

      {/* 3. SEO Defaults */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Default SEO Metadata
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Default titles and search descriptions used when page-specific SEO overrides are omitted.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="defaultSeoTitleEn"
              className="block text-xs font-medium text-foreground"
            >
              Default SEO Title (English)
            </label>
            <input
              id="defaultSeoTitleEn"
              name="defaultSeoTitleEn"
              type="text"
              required
              value={formData.defaultSeoTitleEn}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="defaultSeoTitleTe"
              className="block text-xs font-medium text-foreground"
            >
              Default SEO Title (Telugu)
            </label>
            <input
              id="defaultSeoTitleTe"
              name="defaultSeoTitleTe"
              type="text"
              required
              value={formData.defaultSeoTitleTe}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="defaultSeoDescriptionEn"
              className="block text-xs font-medium text-foreground"
            >
              Default SEO Description (English)
            </label>
            <textarea
              id="defaultSeoDescriptionEn"
              name="defaultSeoDescriptionEn"
              rows={2}
              required
              value={formData.defaultSeoDescriptionEn}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="defaultSeoDescriptionTe"
              className="block text-xs font-medium text-foreground"
            >
              Default SEO Description (Telugu)
            </label>
            <textarea
              id="defaultSeoDescriptionTe"
              name="defaultSeoDescriptionTe"
              rows={2}
              required
              value={formData.defaultSeoDescriptionTe}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? "Saving Settings..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
