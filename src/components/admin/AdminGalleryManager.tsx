"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import type { AdminGalleryItemRecord } from "@/app/api/admin/gallery/route";
import { AdminGalleryCard } from "@/components/admin/AdminGalleryCard";
import { AdminGalleryUploadForm } from "@/components/admin/AdminGalleryUploadForm";
import type { ApiResponse } from "@/types/api-response";

interface AdminGalleryManagerProps {
  initialItems: AdminGalleryItemRecord[];
}

export function AdminGalleryManager({ initialItems }: AdminGalleryManagerProps) {
  const [items, setItems] = useState<AdminGalleryItemRecord[]>(initialItems);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUploadSuccess = (newItem: AdminGalleryItemRecord) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const toggleStatus = async (item: AdminGalleryItemRecord) => {
    const nextStatus = item.status === "published" ? "draft" : "published";
    setActionLoadingId(item.id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await res.json()) as ApiResponse<{ updated: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update visibility.");
      }

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: nextStatus } : it)),
      );
      setSuccessMessage(`Image visibility updated to ${nextStatus}.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Visibility toggle failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateCaptions = async (id: string, captionEn: string, captionTe: string) => {
    setActionLoadingId(id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captionEn, captionTe }),
      });
      const json = (await res.json()) as ApiResponse<{ updated: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to update captions.");
      }

      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, captionEn, captionTe } : it)));
      setSuccessMessage("Image captions updated successfully.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Caption update failed.");
      throw err;
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this gallery image?")) return;

    setActionLoadingId(id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const json = (await res.json()) as ApiResponse<{ deleted: boolean }>;
      if (!res.ok || !json.ok) {
        throw new Error(!json.ok ? json.error.message : "Failed to delete image.");
      }

      setItems((prev) => prev.filter((it) => it.id !== id));
      setSuccessMessage("Image removed from gallery.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Deletion failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="rounded p-0.5 text-red-500 hover:bg-red-100 hover:text-red-700"
            aria-label="Dismiss error notice"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {successMessage ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="rounded p-0.5 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800"
            aria-label="Dismiss success notice"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      <AdminGalleryUploadForm
        onUploadSuccess={handleUploadSuccess}
        onError={setErrorMessage}
        onSuccess={setSuccessMessage}
      />

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Uploaded Gallery Images ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-6 text-center text-xs text-muted-foreground">
            No gallery images uploaded yet. Upload your first photo above.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <AdminGalleryCard
                key={item.id}
                item={item}
                isLoading={actionLoadingId === item.id}
                onToggle={toggleStatus}
                onDelete={handleDelete}
                onUpdateCaptions={handleUpdateCaptions}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
