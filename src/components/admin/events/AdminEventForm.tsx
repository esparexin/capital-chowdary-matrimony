"use client";

import { Loader2, Upload, X } from "lucide-react";
import { EventCoverUploadField } from "./EventCoverUploadField";
import { EventDescriptionFields } from "./EventDescriptionFields";
import { EventLocationFields } from "./EventLocationFields";

export interface EventFormData {
  slug: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  locationEn: string;
  locationTe: string;
  eventDate: string;
  sortOrder: number;
  status: "draft" | "published";
}

export const DEFAULT_EVENT_FORM: EventFormData = {
  slug: "",
  titleEn: "",
  titleTe: "",
  descriptionEn: "",
  descriptionTe: "",
  locationEn: "",
  locationTe: "",
  eventDate: "",
  sortOrder: 0,
  status: "draft",
};

export function toEventFormData(ev: {
  slug: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  locationEn: string;
  locationTe: string;
  eventDate: string | null;
  sortOrder: number;
  status: "draft" | "published";
}): EventFormData {
  return {
    slug: ev.slug,
    titleEn: ev.titleEn,
    titleTe: ev.titleTe,
    descriptionEn: ev.descriptionEn,
    descriptionTe: ev.descriptionTe,
    locationEn: ev.locationEn,
    locationTe: ev.locationTe,
    eventDate: ev.eventDate ?? "",
    sortOrder: ev.sortOrder,
    status: ev.status,
  };
}

interface AdminEventFormProps {
  editingId: string | null;
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
  coverFile: File | null;
  coverPreviewUrl: string | null;
  removeExistingCover: boolean;
  onClearCover: () => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AdminEventForm({
  editingId,
  formData,
  setFormData,
  coverFile,
  coverPreviewUrl,
  removeExistingCover,
  onClearCover,
  isSubmitting,
  onClose,
  onSubmit,
  onFileChange,
}: AdminEventFormProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {editingId ? "Edit Marriage Event" : "Create Marriage Event"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ev-slug" className="block text-xs font-medium text-foreground">
            Slug (URL identifier)
          </label>
          <input
            id="ev-slug"
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="e.g. narasaraopet-parichaya-vedika-2026"
            className={inputClass}
          />
        </div>

        <EventLocationFields formData={formData} setFormData={setFormData} />

        <div>
          <label htmlFor="ev-title-en" className="block text-xs font-medium text-foreground">
            Event Title (English)
          </label>
          <input
            id="ev-title-en"
            type="text"
            required
            value={formData.titleEn}
            onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
            placeholder="e.g. Narasaraopet Parichaya Vedika"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ev-title-te" className="block text-xs font-medium text-foreground">
            Event Title (Telugu)
          </label>
          <input
            id="ev-title-te"
            type="text"
            required
            value={formData.titleTe}
            onChange={(e) => setFormData((p) => ({ ...p, titleTe: e.target.value }))}
            placeholder="e.g. నరసరావుపేట పరిచయ వేదిక"
            className={inputClass}
          />
        </div>

        <EventDescriptionFields formData={formData} setFormData={setFormData} />

        <div>
          <label htmlFor="ev-order" className="block text-xs font-medium text-foreground">
            Sort Order
          </label>
          <input
            id="ev-order"
            type="number"
            min={0}
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="ev-status" className="block text-xs font-medium text-foreground">
            Publication Status
          </label>
          <select
            id="ev-status"
            value={formData.status}
            onChange={(e) =>
              setFormData((p) => ({ ...p, status: e.target.value as "draft" | "published" }))
            }
            className={inputClass}
          >
            <option value="draft">Draft (Hidden from Public)</option>
            <option value="published">Published (Live on Website)</option>
          </select>
        </div>

        <EventCoverUploadField
          coverPreviewUrl={coverPreviewUrl}
          removeExistingCover={removeExistingCover}
          onClearCover={onClearCover}
          onFileChange={onFileChange}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              {coverFile ? "Uploading to Cloudinary..." : "Saving..."}
            </>
          ) : (
            <>
              <Upload className="size-3.5" />
              {editingId ? "Save Changes" : "Create Event"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
