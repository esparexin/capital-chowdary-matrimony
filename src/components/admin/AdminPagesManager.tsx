"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ApiResponse } from "@/types/api-response";
import type { Page } from "@/types/database-types";
import { AdminPageEditModal, type PageFormData } from "@/components/admin/pages/AdminPageEditModal";
import { AdminPagesList } from "@/components/admin/pages/AdminPagesList";

interface AdminPagesManagerProps {
  initialPages: Page[];
}

export function AdminPagesManager({ initialPages }: AdminPagesManagerProps) {
  const [pagesList, setPagesList] = useState<Page[]>(initialPages);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState<PageFormData>({
    titleEn: "",
    titleTe: "",
    summaryEn: "",
    summaryTe: "",
    bodyEn: "",
    bodyTe: "",
    seoTitleEn: "",
    seoTitleTe: "",
    seoDescriptionEn: "",
    seoDescriptionTe: "",
    status: "published",
    verificationStatus: "verified",
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (page: Page) => {
    setEditingPage(page);
    setFormData({
      titleEn: page.titleEn,
      titleTe: page.titleTe,
      summaryEn: page.summaryEn ?? "",
      summaryTe: page.summaryTe ?? "",
      bodyEn: page.bodyEn ?? "",
      bodyTe: page.bodyTe ?? "",
      seoTitleEn: page.seoTitleEn ?? "",
      seoTitleTe: page.seoTitleTe ?? "",
      seoDescriptionEn: page.seoDescriptionEn ?? "",
      seoDescriptionTe: page.seoDescriptionTe ?? "",
      status: page.status as "draft" | "published",
      verificationStatus: page.verificationStatus as "pending_review" | "verified",
    });
  };

  const closeEditModal = () => {
    setEditingPage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/pages/${editingPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = (await res.json()) as ApiResponse<Page>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update page content.");
      }

      setPagesList((prev) => prev.map((it) => (it.id === editingPage.id ? json.data : it)));
      setSuccessMessage(`Page "${json.data.slug}" updated successfully.`);
      closeEditModal();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save page.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (page: Page) => {
    const nextStatus = page.status === "published" ? "draft" : "published";
    setActionLoadingId(page.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: page.titleEn,
          titleTe: page.titleTe,
          status: nextStatus,
        }),
      });

      const json = (await res.json()) as ApiResponse<Page>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to toggle status.");
      }

      setPagesList((prev) => prev.map((it) => (it.id === page.id ? json.data : it)));
      setSuccessMessage(`Page "${json.data.slug}" set to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to toggle status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
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

      <AdminPagesList
        pagesList={pagesList}
        actionLoadingId={actionLoadingId}
        onEdit={openEditModal}
        onToggleStatus={toggleStatus}
      />

      {editingPage && (
        <AdminPageEditModal
          editingPage={editingPage}
          formData={formData}
          setFormData={setFormData}
          isSaving={isSaving}
          onClose={closeEditModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
