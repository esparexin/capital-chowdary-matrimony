"use client";

import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ServiceIcon } from "@/components/public/ServiceIcon";
import { ALLOWED_SERVICE_ICONS } from "@/lib/validations/admin-services-schema";
import type { ApiResponse } from "@/types/api-response";
import type { Service } from "@/types/database-types";

interface AdminServicesManagerProps {
  initialServices: Service[];
}

export function AdminServicesManager({ initialServices }: AdminServicesManagerProps) {
  const [servicesList, setServicesList] = useState<Service[]>(initialServices);
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
    iconName: "HeartHandshake" as (typeof ALLOWED_SERVICE_ICONS)[number],
    sortOrder: 0,
    status: "draft" as "draft" | "published",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      slug: "",
      titleEn: "",
      titleTe: "",
      descriptionEn: "",
      descriptionTe: "",
      iconName: "HeartHandshake",
      sortOrder: (servicesList.length + 1) * 10,
      status: "draft",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      sortOrder: (servicesList.length + 1) * 10,
    }));
    setIsFormOpen(true);
  };

  const openEditForm = (svc: Service) => {
    setEditingId(svc.id);
    setFormData({
      slug: svc.slug,
      titleEn: svc.titleEn,
      titleTe: svc.titleTe,
      descriptionEn: svc.descriptionEn,
      descriptionTe: svc.descriptionTe,
      iconName: (ALLOWED_SERVICE_ICONS.includes(
        svc.iconName as (typeof ALLOWED_SERVICE_ICONS)[number],
      )
        ? svc.iconName
        : "HeartHandshake") as (typeof ALLOWED_SERVICE_ICONS)[number],
      sortOrder: svc.sortOrder,
      status: svc.status as "draft" | "published",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const isEditing = Boolean(editingId);
      const url = isEditing ? `/api/admin/services/${editingId}` : "/api/admin/services";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = (await res.json()) as ApiResponse<Service>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to save service.");
      }

      if (isEditing) {
        setServicesList((prev) =>
          prev.map((it) => (it.id === editingId ? json.data : it)),
        );
        setSuccessMessage("Service updated successfully.");
      } else {
        setServicesList((prev) => [...prev, json.data]);
        setSuccessMessage("New service created successfully.");
      }

      resetForm();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (svc: Service) => {
    const nextStatus = svc.status === "published" ? "draft" : "published";
    setActionLoadingId(svc.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = (await res.json()) as ApiResponse<Service>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update status.");
      }

      setServicesList((prev) =>
        prev.map((it) => (it.id === svc.id ? { ...it, status: nextStatus } : it)),
      );
      setSuccessMessage(`Service status updated to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (svc: Service) => {
    if (!window.confirm(`Are you sure you want to delete "${svc.titleEn}"?`)) return;

    setActionLoadingId(svc.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to delete service.");
      }

      setServicesList((prev) => prev.filter((it) => it.id !== svc.id));
      setSuccessMessage("Service deleted successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete service.");
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
            Matrimonial Services ({servicesList.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Services displayed on public offerings page and homepage overview.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Plus className="size-3.5" />
            Add Service
          </button>
        )}
      </div>

      {/* Create / Edit Form Panel */}
      {isFormOpen && (
        <form
          onSubmit={handleFormSubmit}
          className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {editingId ? "Edit Matrimonial Service" : "Add New Matrimonial Service"}
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
              <label htmlFor="svc-slug" className="block text-xs font-medium text-foreground">
                Slug (URL identifier)
              </label>
              <input
                id="svc-slug"
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                placeholder="e.g. software-employees"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="svc-icon" className="block text-xs font-medium text-foreground">
                Lucide Icon
              </label>
              <select
                id="svc-icon"
                value={formData.iconName}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    iconName: e.target.value as (typeof ALLOWED_SERVICE_ICONS)[number],
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {ALLOWED_SERVICE_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="svc-title-en" className="block text-xs font-medium text-foreground">
                Service Title (English)
              </label>
              <input
                id="svc-title-en"
                type="text"
                required
                value={formData.titleEn}
                onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
                placeholder="e.g. Software & Doctor Profiles"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="svc-title-te" className="block text-xs font-medium text-foreground">
                Service Title (Telugu)
              </label>
              <input
                id="svc-title-te"
                type="text"
                required
                value={formData.titleTe}
                onChange={(e) => setFormData((p) => ({ ...p, titleTe: e.target.value }))}
                placeholder="e.g. సాఫ్ట్‌వేర్ & డాక్టర్ సంబంధాలు"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="svc-desc-en" className="block text-xs font-medium text-foreground">
                Description (English)
              </label>
              <textarea
                id="svc-desc-en"
                rows={2}
                required
                value={formData.descriptionEn}
                onChange={(e) => setFormData((p) => ({ ...p, descriptionEn: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="svc-desc-te" className="block text-xs font-medium text-foreground">
                Description (Telugu)
              </label>
              <textarea
                id="svc-desc-te"
                rows={2}
                required
                value={formData.descriptionTe}
                onChange={(e) => setFormData((p) => ({ ...p, descriptionTe: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="svc-order" className="block text-xs font-medium text-foreground">
                Sort Order
              </label>
              <input
                id="svc-order"
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
              <label htmlFor="svc-status" className="block text-xs font-medium text-foreground">
                Publication Status
              </label>
              <select
                id="svc-status"
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
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              {editingId ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      )}

      {/* Services List */}
      {servicesList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No matrimonial services found. Click "Add Service" above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {servicesList.map((svc) => {
            const isPublished = svc.status === "published";
            const isLoading = actionLoadingId === svc.id;

            return (
              <article
                key={svc.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <ServiceIcon iconName={svc.iconName} className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-xs font-semibold text-foreground">
                        {svc.titleEn}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">({svc.titleTe})</span>
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
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">
                      {svc.descriptionEn}
                    </p>
                    <div className="text-[10px] text-muted-foreground">
                      Slug: <span className="font-mono">{svc.slug}</span> &middot; Sort: {svc.sortOrder}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => toggleStatus(svc)}
                    className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    title={isPublished ? "Unpublish service" : "Publish service"}
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
                    onClick={() => openEditForm(svc)}
                    className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDelete(svc)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    title="Delete service"
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
