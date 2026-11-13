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
import { formatInrAmount } from "@/features/cms/public-offerings-repo";
import type { ApiResponse } from "@/types/api-response";
import type { PricingPlan } from "@/types/database-types";

interface AdminPricingManagerProps {
  initialPlans: PricingPlan[];
}

export function AdminPricingManager({ initialPlans }: AdminPricingManagerProps) {
  const [plansList, setPlansList] = useState<PricingPlan[]>(initialPlans);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    categoryEn: "",
    categoryTe: "",
    registrationFeeInr: 10000,
    maleCommissionInr: 250000,
    femaleCommissionInr: 150000,
    validityMonths: 11,
    termsEn: "11-month non-refundable registration fee. Two-instalment commission upon alliance finalisation.",
    termsTe: "11 నెలల వ్యవధి గల రిజిస్ట్రేషన్ రుసుము వాపసు చేయబడదు. సంబంధం కుదిరిన తర్వాత రెండు విడతలలో చెల్లింపు.",
    verificationStatus: "verified" as "pending_review" | "verified",
    sortOrder: 0,
    status: "draft" as "draft" | "published",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      slug: "",
      categoryEn: "",
      categoryTe: "",
      registrationFeeInr: 10000,
      maleCommissionInr: 250000,
      femaleCommissionInr: 150000,
      validityMonths: 11,
      termsEn: "11-month non-refundable registration fee. Two-instalment commission upon alliance finalisation.",
      termsTe: "11 నెలల వ్యవధి గల రిజిస్ట్రేషన్ రుసుము వాపసు చేయబడదు. సంబంధం కుదిరిన తర్వాత రెండు విడతలలో చెల్లింపు.",
      verificationStatus: "verified",
      sortOrder: (plansList.length + 1) * 10,
      status: "draft",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      sortOrder: (plansList.length + 1) * 10,
    }));
    setIsFormOpen(true);
  };

  const openEditForm = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setFormData({
      slug: plan.slug,
      categoryEn: plan.categoryEn,
      categoryTe: plan.categoryTe,
      registrationFeeInr: plan.registrationFeeInr,
      maleCommissionInr: plan.maleCommissionInr,
      femaleCommissionInr: plan.femaleCommissionInr,
      validityMonths: plan.validityMonths,
      termsEn: plan.termsEn,
      termsTe: plan.termsTe,
      verificationStatus: plan.verificationStatus as "pending_review" | "verified",
      sortOrder: plan.sortOrder,
      status: plan.status as "draft" | "published",
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
      const url = isEditing ? `/api/admin/pricing/${editingId}` : "/api/admin/pricing";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = (await res.json()) as ApiResponse<PricingPlan>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to save pricing plan.");
      }

      if (isEditing) {
        setPlansList((prev) =>
          prev.map((it) => (it.id === editingId ? json.data : it)),
        );
        setSuccessMessage("Pricing plan updated successfully.");
      } else {
        setPlansList((prev) => [...prev, json.data]);
        setSuccessMessage("New pricing plan created successfully.");
      }

      resetForm();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save pricing plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (plan: PricingPlan) => {
    const nextStatus = plan.status === "published" ? "draft" : "published";
    setActionLoadingId(plan.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/pricing/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = (await res.json()) as ApiResponse<PricingPlan>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update status.");
      }

      setPlansList((prev) =>
        prev.map((it) => (it.id === plan.id ? { ...it, status: nextStatus } : it)),
      );
      setSuccessMessage(`Plan status updated to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to toggle plan status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (plan: PricingPlan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.categoryEn}" plan?`)) return;

    setActionLoadingId(plan.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/pricing/${plan.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to delete pricing plan.");
      }

      setPlansList((prev) => prev.filter((it) => it.id !== plan.id));
      setSuccessMessage("Pricing plan removed successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete plan.");
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
            Membership &amp; Fee Tiers ({plansList.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Category fees, commissions, and validity months shown on public plans page.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <Plus className="size-3.5" />
            Add Plan
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
              {editingId ? "Edit Membership Plan" : "Add New Membership Plan"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="plan-reg-fee" className="block text-xs font-medium text-foreground">
                Registration Fee (₹ INR)
              </label>
              <input
                id="plan-reg-fee"
                type="number"
                min={0}
                required
                value={formData.registrationFeeInr}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    registrationFeeInr: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="plan-male-comm" className="block text-xs font-medium text-foreground">
                Male Commission (₹ INR)
              </label>
              <input
                id="plan-male-comm"
                type="number"
                min={0}
                required
                value={formData.maleCommissionInr}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    maleCommissionInr: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="plan-fem-comm" className="block text-xs font-medium text-foreground">
                Female Commission (₹ INR)
              </label>
              <input
                id="plan-fem-comm"
                type="number"
                min={0}
                required
                value={formData.femaleCommissionInr}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    femaleCommissionInr: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="plan-validity" className="block text-xs font-medium text-foreground">
                Validity (Months)
              </label>
              <input
                id="plan-validity"
                type="number"
                min={1}
                required
                value={formData.validityMonths}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    validityMonths: parseInt(e.target.value, 10) || 11,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
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
              {editingId ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      )}

      {/* Plans List */}
      {plansList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          No pricing plans found. Click "Add Plan" above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {plansList.map((plan) => {
            const isPublished = plan.status === "published";
            const isLoading = actionLoadingId === plan.id;

            return (
              <article
                key={plan.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="truncate text-xs font-semibold text-foreground">
                      {plan.categoryEn}
                    </h4>
                    <span className="text-[11px] text-muted-foreground">({plan.categoryTe})</span>
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

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground">
                    <span>
                      Reg Fee:{" "}
                      <strong className="text-primary">
                        {formatInrAmount(plan.registrationFeeInr)}
                      </strong>
                    </span>
                    <span className="text-muted-foreground">
                      Male Comm: {formatInrAmount(plan.maleCommissionInr)}
                    </span>
                    <span className="text-muted-foreground">
                      Female Comm: {formatInrAmount(plan.femaleCommissionInr)}
                    </span>
                    <span className="text-muted-foreground">
                      Validity: {plan.validityMonths} mos
                    </span>
                  </div>

                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    {plan.termsEn}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => toggleStatus(plan)}
                    className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
                    title={isPublished ? "Unpublish plan" : "Publish plan"}
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
                    onClick={() => openEditForm(plan)}
                    className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDelete(plan)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    title="Delete plan"
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
