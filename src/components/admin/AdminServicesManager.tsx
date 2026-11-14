"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import { ALLOWED_SERVICE_ICONS } from "@/lib/validations/admin-services-schema";
import type { ApiResponse } from "@/types/api-response";
import type { Service } from "@/types/database-types";
import {
  AdminServiceForm,
  type ServiceFormData,
} from "@/components/admin/services/AdminServiceForm";
import { AdminServicesList } from "@/components/admin/services/AdminServicesList";

const DEFAULT_FORM_DATA: ServiceFormData = {
  slug: "",
  titleEn: "",
  titleTe: "",
  descriptionEn: "",
  descriptionTe: "",
  iconName: "HeartHandshake",
  sortOrder: 0,
  status: "draft",
};

interface AdminServicesManagerProps {
  initialServices: Service[];
}

export function AdminServicesManager({ initialServices }: AdminServicesManagerProps) {
  const [servicesList, setServicesList] = useState<Service[]>(initialServices);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({ ...DEFAULT_FORM_DATA, sortOrder: (servicesList.length + 1) * 10 });
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
        throw new Error(!json.ok ? json.error.message : "Operation failed.");
      }

      if (isEditing) {
        setServicesList((prev) => prev.map((s) => (s.id === editingId ? json.data : s)));
        setSuccessMessage("Service updated successfully.");
      } else {
        setServicesList((prev) => [...prev, json.data]);
        setSuccessMessage("Service created successfully.");
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
        throw new Error(!json.ok ? json.error.message : "Failed to toggle status.");
      }

      setServicesList((prev) => prev.map((s) => (s.id === svc.id ? json.data : s)));
      setSuccessMessage(`Service set to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (svc: Service) => {
    if (!confirm(`Are you sure you want to delete service "${svc.titleEn}"?`)) {
      return;
    }

    setActionLoadingId(svc.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to delete service.");
      }

      setServicesList((prev) => prev.filter((s) => s.id !== svc.id));
      setSuccessMessage("Service deleted successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete service.");
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

      {isFormOpen && (
        <AdminServiceForm
          editingId={editingId}
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onClose={resetForm}
          onSubmit={handleFormSubmit}
        />
      )}

      <AdminServicesList
        servicesList={servicesList}
        actionLoadingId={actionLoadingId}
        onEdit={openEditForm}
        onToggleStatus={toggleStatus}
        onDelete={handleDelete}
      />
    </div>
  );
}
