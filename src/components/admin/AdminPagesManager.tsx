"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, FileText, Loader2, Pencil, X } from "lucide-react";
import type { ApiResponse } from "@/types/api-response";
import type { Page } from "@/types/database-types";

interface AdminPagesManagerProps {
  initialPages: Page[];
}

export function AdminPagesManager({ initialPages }: AdminPagesManagerProps) {
  const [pagesList, setPagesList] = useState<Page[]>(initialPages);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit modal state
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
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
    status: "published" as "draft" | "published",
    verificationStatus: "verified" as "pending_review" | "verified",
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
        throw new Error(!json.ok ? json.error.message : "Failed to update visibility.");
      }

      setPagesList((prev) =>
        prev.map((it) => (it.id === page.id ? { ...it, status: nextStatus } : it)),
      );
      setSuccessMessage(`Page "${page.slug}" visibility updated to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update visibility.");
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

      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Informational &amp; Legal Pages ({pagesList.length})
        </h2>
        <p className="text-xs text-muted-foreground">
          Bilingual copy, legal terms, process steps, and page-specific SEO for public routes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {pagesList.map((pg) => {
          const isPublished = pg.status === "published";
          const isVerified = pg.verificationStatus === "verified";
          const isLoading = actionLoadingId === pg.id;

          return (
            <article
              key={pg.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="size-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-xs font-semibold text-foreground">{pg.titleEn}</h4>
                    <span className="text-[11px] text-muted-foreground">({pg.titleTe})</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      /{pg.slug}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isPublished ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                      }`}
                    >
                      {isPublished ? "Live" : "Draft"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isVerified
                          ? "bg-sky-600/20 text-sky-800 dark:text-sky-300"
                          : "bg-amber-600/20 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {isVerified ? "Verified" : "Pending Review"}
                    </span>
                  </div>

                  {pg.summaryEn && (
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">{pg.summaryEn}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => toggleStatus(pg)}
                  className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted disabled:opacity-50"
                  title={isPublished ? "Unpublish page" : "Publish page"}
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
                  onClick={() => openEditModal(pg)}
                  className="inline-flex items-center gap-1 rounded border border-input px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                >
                  <Pencil className="size-3.5" />
                  Edit Content
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Edit Modal / Slide-over */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Edit Page: {editingPage.titleEn}
                </h3>
                <p className="font-mono text-xs text-muted-foreground">/{editingPage.slug}</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleEn}
                    onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Title (Telugu)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleTe}
                    onChange={(e) => setFormData((p) => ({ ...p, titleTe: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Summary (English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.summaryEn}
                    onChange={(e) => setFormData((p) => ({ ...p, summaryEn: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Summary (Telugu)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.summaryTe}
                    onChange={(e) => setFormData((p) => ({ ...p, summaryTe: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground">
                    Main Body Content (English)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bodyEn}
                    onChange={(e) => setFormData((p) => ({ ...p, bodyEn: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground">
                    Main Body Content (Telugu)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bodyTe}
                    onChange={(e) => setFormData((p) => ({ ...p, bodyTe: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    SEO Meta Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitleEn}
                    onChange={(e) => setFormData((p) => ({ ...p, seoTitleEn: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    SEO Meta Title (Telugu)
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitleTe}
                    onChange={(e) => setFormData((p) => ({ ...p, seoTitleTe: e.target.value }))}
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground">
                    SEO Meta Description (English)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDescriptionEn}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, seoDescriptionEn: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-foreground">
                    SEO Meta Description (Telugu)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDescriptionTe}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, seoDescriptionTe: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        status: e.target.value as "draft" | "published",
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="published">Published (Live on Website)</option>
                    <option value="draft">Draft (Hidden from Public)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground">
                    Verification Status
                  </label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        verificationStatus: e.target.value as "pending_review" | "verified",
                      }))
                    }
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="verified">Verified (Approved Content)</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="size-3.5 animate-spin" />}
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
