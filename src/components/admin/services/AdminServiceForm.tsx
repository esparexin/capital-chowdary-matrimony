"use client";

import { Loader2, X } from "lucide-react";
import { ALLOWED_SERVICE_ICONS } from "@/lib/validations/admin-services-schema";

export interface ServiceFormData {
  slug: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  iconName: (typeof ALLOWED_SERVICE_ICONS)[number];
  sortOrder: number;
  status: "draft" | "published";
}

interface AdminServiceFormProps {
  editingId: string | null;
  formData: ServiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminServiceForm({
  editingId,
  formData,
  setFormData,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminServiceFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {editingId ? "Edit Matrimonial Service" : "Add New Matrimonial Service"}
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
          {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
          {editingId ? "Save Changes" : "Create Service"}
        </button>
      </div>
    </form>
  );
}
