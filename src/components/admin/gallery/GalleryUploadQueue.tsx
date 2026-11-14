"use client";

import Image from "next/image";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { formatFileSize, MAX_IMAGE_UPLOAD_COUNT } from "@/lib/validations/image-upload-schema";
import type { GalleryUploadQueueItem } from "./gallery-upload-service";

interface GalleryUploadQueueProps {
  items: GalleryUploadQueueItem[];
  isUploading: boolean;
  onRemoveItem: (id: string) => void;
  onUpdateCaption: (id: string, captionEn: string, captionTe: string) => void;
  onClearAll: () => void;
}

export function GalleryUploadQueue({
  items,
  isUploading,
  onRemoveItem,
  onUpdateCaption,
  onClearAll,
}: GalleryUploadQueueProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            Selected Images ({items.length} / {MAX_IMAGE_UPLOAD_COUNT})
          </span>
          <span className="text-[11px] text-muted-foreground">
            {items.filter((i) => i.status === "success").length} uploaded,{" "}
            {items.filter((i) => i.status === "error").length} failed
          </span>
        </div>
        {!isUploading && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-medium text-destructive hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => {
          const isItemUploading = item.status === "uploading";
          const isSuccess = item.status === "success";
          const isError = item.status === "error";

          return (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-lg border bg-card p-2.5 text-xs shadow-xs transition-colors ${
                isSuccess
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : isError
                    ? "border-destructive/50 bg-destructive/5"
                    : "border-border"
              }`}
            >
              <div className="flex gap-2.5">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted/40">
                  <Image
                    src={item.previewUrl}
                    alt={item.file.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-1">
                    <p className="truncate font-medium text-foreground" title={item.file.name}>
                      {item.file.name}
                    </p>
                    {!isUploading && !isSuccess && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(item.file.size)}
                  </p>

                  <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
                    {isItemUploading && (
                      <span className="inline-flex items-center gap-1 font-medium text-primary">
                        <Loader2 className="size-3 animate-spin" /> Uploading...
                      </span>
                    )}
                    {isSuccess && (
                      <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Uploaded
                      </span>
                    )}
                    {isError && (
                      <span
                        className="inline-flex items-center gap-1 font-medium text-destructive"
                        title={item.errorMessage}
                      >
                        <AlertCircle className="size-3 shrink-0" />
                        <span className="truncate">{item.errorMessage || "Failed"}</span>
                      </span>
                    )}
                    {item.status === "idle" && (
                      <span className="text-muted-foreground">Ready to upload</span>
                    )}
                  </div>
                </div>
              </div>

              {!isSuccess && (
                <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
                  <input
                    type="text"
                    value={item.captionEn}
                    onChange={(e) => onUpdateCaption(item.id, e.target.value, item.captionTe)}
                    placeholder="Caption (EN)"
                    disabled={isUploading}
                    className="block w-full rounded border border-input bg-background px-2 py-0.5 text-[11px] shadow-xs"
                  />
                  <input
                    type="text"
                    value={item.captionTe}
                    onChange={(e) => onUpdateCaption(item.id, item.captionEn, e.target.value)}
                    placeholder="Caption (TE)"
                    disabled={isUploading}
                    className="block w-full rounded border border-input bg-background px-2 py-0.5 text-[11px] shadow-xs"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
