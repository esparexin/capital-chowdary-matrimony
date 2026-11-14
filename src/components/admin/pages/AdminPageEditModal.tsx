"use client";

import { Loader2, X } from "lucide-react";
import type { Page } from "@/types/database-types";

export interface PageFormData {
  titleEn: string;
  titleTe: string;
  summaryEn: string;
  summaryTe: string;
  bodyEn: string;
  bodyTe: string;
  seoTitleEn: string;
  seoTitleTe: string;
  seoDescriptionEn: string;
  seoDescriptionTe: string;
  status: "draft" | "published";
  verificationStatus: "pending_review" | "verified";
}

interface AdminPageEditModalProps {
  editingPage: Page;
  formData: PageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PageFormData>>;
  isSaving: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
}

export function AdminPageEditModal({
  editingPage,
  formData,
  setFormData,
  isSaving,
  onClose,
  onSave,
}: AdminPageEditModalProps) {
  return (
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
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-foreground">Title (English)</label>
              <input
                type="text"
                required
                value={formData.titleEn}
                onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Title (Telugu)</label>
              <input
                type="text"
                required
                value={formData.titleTe}
                onChange={(e) => setFormData((p) => ({ ...p, titleTe: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Summary (English)</label>
              <textarea
                rows={2}
                value={formData.summaryEn}
                onChange={(e) => setFormData((p) => ({ ...p, summaryEn: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground">Summary (Telugu)</label>
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
                onChange={(e) => setFormData((p) => ({ ...p, seoDescriptionEn: e.target.value }))}
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
                onChange={(e) => setFormData((p) => ({ ...p, seoDescriptionTe: e.target.value }))}
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
                  setFormData((p) => ({ ...p, status: e.target.value as "draft" | "published" }))
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
              onClick={onClose}
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
  );
}
