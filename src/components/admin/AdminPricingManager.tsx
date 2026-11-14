"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import type { ApiResponse } from "@/types/api-response";
import type { PricingPlan } from "@/types/database-types";
import {
  AdminPricingForm,
  DEFAULT_PRICING_FORM,
  type PricingPlanFormData,
} from "@/components/admin/pricing/AdminPricingForm";
import { AdminPricingList } from "@/components/admin/pricing/AdminPricingList";

interface AdminPricingManagerProps {
  initialPlans: PricingPlan[];
}

export function AdminPricingManager({ initialPlans }: AdminPricingManagerProps) {
  const [plansList, setPlansList] = useState<PricingPlan[]>(initialPlans);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PricingPlanFormData>(DEFAULT_PRICING_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      ...DEFAULT_PRICING_FORM,
      sortOrder: (plansList.length + 1) * 10,
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
        throw new Error(!json.ok ? json.error.message : "Operation failed.");
      }

      if (isEditing) {
        setPlansList((prev) => prev.map((p) => (p.id === editingId ? json.data : p)));
        setSuccessMessage("Pricing plan updated successfully.");
      } else {
        setPlansList((prev) => [...prev, json.data]);
        setSuccessMessage("Pricing plan created successfully.");
      }

      resetForm();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save plan.");
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
        throw new Error(!json.ok ? json.error.message : "Failed to toggle status.");
      }

      setPlansList((prev) => prev.map((p) => (p.id === plan.id ? json.data : p)));
      setSuccessMessage(`Plan set to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (plan: PricingPlan) => {
    if (!confirm(`Are you sure you want to delete plan "${plan.categoryEn}"?`)) {
      return;
    }

    setActionLoadingId(plan.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/pricing/${plan.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to delete plan.");
      }

      setPlansList((prev) => prev.filter((p) => p.id !== plan.id));
      setSuccessMessage("Pricing plan deleted successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete plan.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Pricing Plans & Commissions ({plansList.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Bilingual membership tiers, registration fees, and alliance commission schedules.
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

      {isFormOpen && (
        <AdminPricingForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onClose={resetForm}
          onSubmit={handleFormSubmit}
        />
      )}

      <AdminPricingList
        plansList={plansList}
        actionLoadingId={actionLoadingId}
        onEdit={openEditForm}
        onToggleStatus={toggleStatus}
        onDelete={handleDelete}
      />
    </div>
  );
}
