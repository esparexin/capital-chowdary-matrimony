"use client";

import { Loader2, X } from "lucide-react";
import { PricingFeeFields } from "./PricingFeeFields";

export interface PricingPlanFormData {
  slug: string;
  categoryEn: string;
  categoryTe: string;
  registrationFeeInr: number;
  maleCommissionInr: number;
  femaleCommissionInr: number;
  validityMonths: number;
  termsEn: string;
  termsTe: string;
  verificationStatus: "pending_review" | "verified";
  sortOrder: number;
  status: "draft" | "published";
}

export const DEFAULT_PRICING_FORM: PricingPlanFormData = {
  slug: "",
  categoryEn: "",
  categoryTe: "",
  registrationFeeInr: 10000,
  maleCommissionInr: 250000,
  femaleCommissionInr: 150000,
  validityMonths: 11,
  termsEn:
    "11-month non-refundable registration fee. Two-instalment commission upon alliance finalisation.",
  termsTe: "11 నెలల వ్యవధి గల రిజిస్ట్రేషన్ రుసుము వాపసు చేయబడదు. సంబంధం కుదిరిన తర్వాత రెండు విడతలలో చెల్లింపు.",
  verificationStatus: "verified",
  sortOrder: 0,
  status: "draft",
};

interface AdminPricingFormProps {
  editingId: string | null;
  formData: PricingPlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PricingPlanFormData>>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminPricingForm({
  editingId,
  formData,
  setFormData,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminPricingFormProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-semibold text-foreground">
          {editingId ? "Edit Membership Plan" : "Add New Membership Plan"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <label htmlFor="plan-slug" className="block text-xs font-medium text-foreground">
            Slug (URL identifier)
          </label>
          <input
            id="plan-slug"
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
            placeholder="e.g. software-doctor-alliances"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="plan-cat-en" className="block text-xs font-medium text-foreground">
            Category Title (English)
          </label>
          <input
            id="plan-cat-en"
            type="text"
            required
            value={formData.categoryEn}
            onChange={(e) => setFormData((p) => ({ ...p, categoryEn: e.target.value }))}
            placeholder="e.g. Software & Doctor Alliances"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="plan-cat-te" className="block text-xs font-medium text-foreground">
            Category Title (Telugu)
          </label>
          <input
            id="plan-cat-te"
            type="text"
            required
            value={formData.categoryTe}
            onChange={(e) => setFormData((p) => ({ ...p, categoryTe: e.target.value }))}
            placeholder="e.g. సాఫ్ట్‌వేర్ & డాక్టర్ సంబంధాలు"
            className={inputClass}
          />
        </div>

        <PricingFeeFields formData={formData} setFormData={setFormData} />

        <div>
          <label htmlFor="plan-status" className="block text-xs font-medium text-foreground">
            Publication Status
          </label>
          <select
            id="plan-status"
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

        <div>
          <label htmlFor="plan-order" className="block text-xs font-medium text-foreground">
            Sort Order
          </label>
          <input
            id="plan-order"
            type="number"
            min={0}
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData((p) => ({ ...p, sortOrder: parseInt(e.target.value, 10) || 0 }))
            }
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2 md:col-span-3">
          <label htmlFor="plan-terms-en" className="block text-xs font-medium text-foreground">
            Payment Terms (English)
          </label>
          <textarea
            id="plan-terms-en"
            rows={2}
            required
            value={formData.termsEn}
            onChange={(e) => setFormData((p) => ({ ...p, termsEn: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2 md:col-span-3">
          <label htmlFor="plan-terms-te" className="block text-xs font-medium text-foreground">
            Payment Terms (Telugu)
          </label>
          <textarea
            id="plan-terms-te"
            rows={2}
            required
            value={formData.termsTe}
            onChange={(e) => setFormData((p) => ({ ...p, termsTe: e.target.value }))}
            className={inputClass}
          />
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
          {editingId ? "Save Changes" : "Create Plan"}
        </button>
      </div>
    </form>
  );
}
