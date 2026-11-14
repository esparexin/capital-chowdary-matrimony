"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { Star, X } from "lucide-react";
import { formatFileSize, MAX_IMAGE_UPLOAD_COUNT } from "@/lib/validations/image-upload-schema";

interface EventImagePreviewGridProps {
  files: File[];
  coverIndex: number;
  onSetCoverIndex: (index: number) => void;
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
}

export function EventImagePreviewGrid({
  files,
  coverIndex,
  onSetCoverIndex,
  onRemoveFile,
  disabled,
}: EventImagePreviewGridProps) {
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (files.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-foreground">
        <span>
          Selected Images ({files.length} / {MAX_IMAGE_UPLOAD_COUNT})
        </span>
        <span className="text-[11px] text-muted-foreground">
          Photo #{coverIndex + 1} designated as Cover
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
        {files.map((file, idx) => {
          const isCover = idx === coverIndex;
          const previewUrl = previewUrls[idx];

          return (
            <div
              key={`${file.name}-${file.size}-${idx}`}
              className={`relative overflow-hidden rounded-lg border p-1.5 transition-colors ${
                isCover
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card"
              }`}
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted/30">
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                )}

                {isCover ? (
                  <span className="absolute top-1 left-1 inline-flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-xs">
                    <Star className="size-2.5 fill-current" /> Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSetCoverIndex(idx)}
                    className="absolute top-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-primary"
                  >
                    Set Cover
                  </button>
                )}

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onRemoveFile(idx)}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              <div className="mt-1.5 space-y-0.5 px-0.5">
                <p className="truncate text-[11px] font-medium text-foreground" title={file.name}>
                  {file.name}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
