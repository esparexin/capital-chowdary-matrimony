"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import type { ApiResponse } from "@/types/api-response";
import type { SiteSettings } from "@/types/database-types";
import { SettingsIdentitySection } from "@/components/admin/settings/SettingsIdentitySection";
import { SettingsContactSection } from "@/components/admin/settings/SettingsContactSection";
import { SettingsSeoSection } from "@/components/admin/settings/SettingsSeoSection";

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

      <SettingsIdentitySection
        businessNameEn={formData.businessNameEn}
        businessNameTe={formData.businessNameTe}
        taglineEn={formData.taglineEn}
        taglineTe={formData.taglineTe}
        onChange={handleChange}
      />

      <SettingsContactSection
        phoneNumber={formData.phoneNumber}
        whatsappNumber={formData.whatsappNumber}
        contactEmail={formData.contactEmail}
        mapUrl={formData.mapUrl}
        addressEn={formData.addressEn}
        addressTe={formData.addressTe}
        isContactVerified={formData.isContactVerified}
        onChange={handleChange}
      />

      <SettingsSeoSection
        defaultSeoTitleEn={formData.defaultSeoTitleEn}
        defaultSeoTitleTe={formData.defaultSeoTitleTe}
        defaultSeoDescriptionEn={formData.defaultSeoDescriptionEn}
        defaultSeoDescriptionTe={formData.defaultSeoDescriptionTe}
        onChange={handleChange}
      />

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
