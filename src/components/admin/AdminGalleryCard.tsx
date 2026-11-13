"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Eye, EyeOff, Pencil, Trash2, X } from "lucide-react";
import type { AdminGalleryItemRecord } from "@/app/api/admin/gallery/route";

interface AdminGalleryCardProps {
  item: AdminGalleryItemRecord;
  isLoading: boolean;
  onToggle: (item: AdminGalleryItemRecord) => void;
  onDelete: (id: string) => void;
  onUpdateCaptions: (id: string, captionEn: string, captionTe: string) => Promise<void>;
}

export function AdminGalleryCard({
  item,
  isLoading,
  onToggle,
  onDelete,
  onUpdateCaptions,
}: AdminGalleryCardProps) {
  const isPublished = item.status === "published";
  const [isEditing, setIsEditing] = useState(false);
  const [captionEn, setCaptionEn] = useState(item.captionEn);
  const [captionTe, setCaptionTe] = useState(item.captionTe);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateCaptions(item.id, captionEn, captionTe);
      setIsEditing(false);
    } catch {
      // Error handled by parent manager
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCaptionEn(item.captionEn);
    setCaptionTe(item.captionTe);
    setIsEditing(false);
  };

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="relative aspect-4/3 w-full bg-muted/30">
        <Image
          src={item.secureUrl}
          alt={item.captionEn || "Gallery image"}
          fill
          className="object-cover"
          sizes="300px"
        />
        <span
          className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isPublished ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
          }`}
        >
          {isPublished ? "Live" : "Draft"}
        </span>
      </div>

      <div className="space-y-2 p-3">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-2">
            <div>
              <label
                htmlFor={`edit-en-${item.id}`}
                className="block text-[11px] font-medium text-muted-foreground"
              >
                Caption (English)
              </label>
              <input
                id={`edit-en-${item.id}`}
                type="text"
                value={captionEn}
                onChange={(e) => setCaptionEn(e.target.value)}
                disabled={isSaving}
                className="mt-0.5 block w-full rounded border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                placeholder="English caption"
              />
            </div>
            <div>
              <label
                htmlFor={`edit-te-${item.id}`}
                className="block text-[11px] font-medium text-muted-foreground"
              >
                Caption (Telugu)
              </label>
              <input
                id={`edit-te-${item.id}`}
                type="text"
                value={captionTe}
                onChange={(e) => setCaptionTe(e.target.value)}
                disabled={isSaving}
                className="mt-0.5 block w-full rounded border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                placeholder="తెలుగు వివరణ"
              />
            </div>
            <div className="flex items-center justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
              >
                <X className="size-3" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                <Check className="size-3" />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="truncate text-xs font-medium text-foreground">
              {item.captionEn || "No English caption"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {item.captionTe || "తెలుగు వివరణ లేదు"}
            </p>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                <Pencil className="size-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onToggle(item)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                {isPublished ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                <span>{isPublished ? "Unpublish" : "Publish"}</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 text-xs text-destructive transition-colors hover:opacity-80 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
