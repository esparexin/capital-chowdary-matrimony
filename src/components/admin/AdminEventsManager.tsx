"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { AdminMarriageEventRecord } from "@/app/api/admin/events/route";
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

interface AdminEventsManagerProps {
  initialEvents: AdminMarriageEventRecord[];
}

export function AdminEventsManager({ initialEvents }: AdminEventsManagerProps) {
  const [eventsList, setEventsList] = useState<AdminMarriageEventRecord[]>(initialEvents);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    titleEn: "",
    titleTe: "",
    descriptionEn: "",
    descriptionTe: "",
    locationEn: "",
    locationTe: "",
    eventDate: "",
    sortOrder: 0,
    status: "draft" as "draft" | "published",
  });

  // Media state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [removeExistingCover, setRemoveExistingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      slug: "",
      titleEn: "",
      titleTe: "",
      descriptionEn: "",
      descriptionTe: "",
      locationEn: "",
      locationTe: "",
      eventDate: "",
      sortOrder: (eventsList.length + 1) * 10,
      status: "draft",
    });
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setRemoveExistingCover(false);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      sortOrder: (eventsList.length + 1) * 10,
    }));
    setIsFormOpen(true);
  };

  const openEditForm = (ev: AdminMarriageEventRecord) => {
    setEditingId(ev.id);
    setFormData({
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
    });
    setCoverFile(null);
    setCoverPreviewUrl(ev.coverUrl);
    setRemoveExistingCover(false);
    setIsFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) {
      setErrorMessage("Please select a JPEG, PNG, or WebP image.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMessage("Cover image must be under 5MB.");
      return;
    }

    setErrorMessage(null);
    setCoverFile(selected);
    setCoverPreviewUrl(URL.createObjectURL(selected));
    setRemoveExistingCover(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let cloudinaryData: Partial<CloudinaryUploadResponse> = {};

      if (coverFile) {
        // Upload to Cloudinary via signed URL
        const sigRes = await fetch("/api/admin/media/signature?category=events", {
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
        uploadBody.append("file", coverFile);
        uploadBody.append("api_key", apiKey);
        uploadBody.append("timestamp", String(timestamp));
        uploadBody.append("signature", signature);
        uploadBody.append("folder", folder);

        const cldRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: uploadBody,
          },
        );
        const cldJson = (await cldRes.json()) as CloudinaryUploadResponse;

        if (!cldRes.ok) {
          throw new Error(cldJson.error?.message || "Cloudinary cover upload failed.");
        }

        cloudinaryData = cldJson;
      }

      const isEditing = Boolean(editingId);
      const url = isEditing ? `/api/admin/events/${editingId}` : "/api/admin/events";
      const method = isEditing ? "PATCH" : "POST";

      const payload = {
        ...formData,
        eventDate: formData.eventDate ? formData.eventDate : null,
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
        removeCover: removeExistingCover && !coverFile,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse<AdminMarriageEventRecord>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to save marriage event.");
      }

      if (isEditing) {
        setEventsList((prev) =>
          prev.map((it) => (it.id === editingId ? json.data : it)),
        );
        setSuccessMessage("Marriage event updated successfully.");
      } else {
        setEventsList((prev) => [json.data, ...prev]);
        setSuccessMessage("New marriage event created successfully.");
      }

      resetForm();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save marriage event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (ev: AdminMarriageEventRecord) => {
    const nextStatus = ev.status === "published" ? "draft" : "published";
    setActionLoadingId(ev.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = (await res.json()) as ApiResponse<AdminMarriageEventRecord>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update event status.");
      }

      setEventsList((prev) =>
        prev.map((it) => (it.id === ev.id ? { ...it, status: nextStatus } : it)),
      );
      setSuccessMessage(`Event status updated to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (ev: AdminMarriageEventRecord) => {
    if (!window.confirm(`Are you sure you want to delete event "${ev.titleEn}"?`)) return;

    setActionLoadingId(ev.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to delete event.");
      }

      setEventsList((prev) => prev.filter((it) => it.id !== ev.id));
      setSuccessMessage("Event removed successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete event.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Marriage Events ({eventsList.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Upcoming and organized community marriage gatherings and muhurtham events.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Plus className="size-3.5" />
            Add Event
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {editingId ? "Edit Marriage Event" : "Create Marriage Event"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="ev-date" className="block text-xs font-medium text-foreground">
                Event Date (Optional)
              </label>
              <input
                id="ev-date"
                type="text"
                value={formData.eventDate}
                onChange={(e) => setFormData((p) => ({ ...p, eventDate: e.target.value }))}
                placeholder="e.g. 15 December 2026 or 2026-12-15"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="ev-loc-en" className="block text-xs font-medium text-foreground">
                Location (English)
              </label>
              <input
                id="ev-loc-en"
                type="text"
                value={formData.locationEn}
                onChange={(e) => setFormData((p) => ({ ...p, locationEn: e.target.value }))}
                placeholder="e.g. Kamma Kalyana Mandapam, Narasaraopet"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="ev-loc-te" className="block text-xs font-medium text-foreground">
                Location (Telugu)
              </label>
              <input
                id="ev-loc-te"
                type="text"
                value={formData.locationTe}
                onChange={(e) => setFormData((p) => ({ ...p, locationTe: e.target.value }))}
                placeholder="e.g. కమ్మ కళ్యాణ మండపం, నరసరావుపేట"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ev-desc-en" className="block text-xs font-medium text-foreground">
                Description (English)
              </label>
              <textarea
                id="ev-desc-en"
                rows={2}
                value={formData.descriptionEn}
                onChange={(e) => setFormData((p) => ({ ...p, descriptionEn: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ev-desc-te" className="block text-xs font-medium text-foreground">
                Description (Telugu)
              </label>
              <textarea
                id="ev-desc-te"
                rows={2}
                value={formData.descriptionTe}
                onChange={(e) => setFormData((p) => ({ ...p, descriptionTe: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="draft">Draft (Hidden from Public)</option>
                <option value="published">Published (Live on Website)</option>
              </select>
            </div>

            {/* Cloudinary Cover Image */}
            <div className="sm:col-span-2 border-t border-border pt-4">
              <label className="block text-xs font-medium text-foreground">
                Event Cover Image (Cloudinary)
              </label>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Uploads securely to Cloudinary under the events folder. Max 5MB.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4">
                {coverPreviewUrl && !removeExistingCover ? (
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <Image
                      src={coverPreviewUrl}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreviewUrl(null);
                        setRemoveExistingCover(true);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex size-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                    <ImageIcon className="size-8 stroke-1" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    id="ev-cover-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/80"
                  />
                  {removeExistingCover && (
                    <p className="mt-1 text-[11px] text-amber-600">
                      Cover image will be removed upon saving.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={resetForm}
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
      )}

      {/* Events List */}
      {eventsList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No marriage events found. Click "Add Event" above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {eventsList.map((ev) => {
            const isPublished = ev.status === "published";
            const isLoading = actionLoadingId === ev.id;

            return (
              <article
                key={ev.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {ev.coverUrl ? (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={ev.coverUrl}
                        alt={ev.titleEn}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
                      <ImageIcon className="size-6 stroke-1" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-xs font-semibold text-foreground">
                        {ev.titleEn}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">({ev.titleTe})</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isPublished
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-600 text-white"
                        }`}
                      >
                        {isPublished ? "Live" : "Draft"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      {ev.eventDate ? (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="size-3" />
                          {ev.eventDate}
                        </span>
                      ) : null}
                      {ev.locationEn ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" />
                          {ev.locationEn}
                        </span>
                      ) : null}
                      <span>Order: {ev.sortOrder}</span>
                    </div>

                    {ev.descriptionEn ? (
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">
                        {ev.descriptionEn}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => toggleStatus(ev)}
                    className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    title={isPublished ? "Unpublish event" : "Publish event"}
                  >
                    {isLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isPublished ? (
                      <>
                        <EyeOff className="size-3.5" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" />
                        Publish
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditForm(ev)}
                    className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDelete(ev)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    title="Delete event"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
