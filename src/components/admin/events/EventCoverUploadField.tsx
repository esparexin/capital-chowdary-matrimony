"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { X, AlertCircle } from "lucide-react";
import {
  MAX_IMAGE_UPLOAD_COUNT,
  isDuplicateFile,
  validateBatchImageFiles,
} from "@/lib/validations/image-upload-schema";
import { EventImagePreviewGrid } from "./EventImagePreviewGrid";

interface EventCoverUploadFieldProps {
  coverPreviewUrl: string | null;
  removeExistingCover: boolean;
  onClearCover: () => void;
  selectedFiles: File[];
  coverIndex: number;
  onSetCoverIndex: (index: number) => void;
  onRemoveFile: (index: number) => void;
  onFilesSelected: (newFiles: File[]) => void;
  disabled?: boolean;
}

export function EventCoverUploadField({
  coverPreviewUrl,
  removeExistingCover,
  onClearCover,
  selectedFiles,
  coverIndex,
  onSetCoverIndex,
  onRemoveFile,
  onFilesSelected,
  disabled,
}: EventCoverUploadFieldProps) {
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0) return;

    const nonDuplicates = rawFiles.filter((f) => !isDuplicateFile(f, selectedFiles));
    const duplicateCount = rawFiles.length - nonDuplicates.length;

    const validation = validateBatchImageFiles(
      nonDuplicates,
      selectedFiles.length,
      MAX_IMAGE_UPLOAD_COUNT,
    );

    if (validation.rejected.length > 0 || duplicateCount > 0) {
      const messages: string[] = [];
      if (duplicateCount > 0) messages.push(`${duplicateCount} duplicate file(s) skipped.`);
      if (validation.errorSummary) messages.push(validation.errorSummary);
      setFieldError(messages.join(" "));
    } else {
      setFieldError(null);
    }

    if (validation.accepted.length > 0) {
      onFilesSelected(validation.accepted);
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="sm:col-span-2 border-t border-border pt-4 space-y-3">
      <div>
        <label className="block text-xs font-medium text-foreground">
          Event Imagery &amp; Cover Photo (Cloudinary)
        </label>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Select up to {MAX_IMAGE_UPLOAD_COUNT} images (JPEG, PNG, WebP up to 5MB each). The
          designated Cover Photo becomes the event header; additional photos are saved to the
          gallery.
        </p>
      </div>

      {fieldError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-[11px] text-destructive"
        >
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{fieldError}</span>
        </div>
      )}

      {coverPreviewUrl && !removeExistingCover && selectedFiles.length === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-2.5">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            <Image
              src={coverPreviewUrl}
              alt="Current cover preview"
              fill
              className="object-cover"
              sizes="80px"
            />
            {!disabled && (
              <button
                type="button"
                onClick={onClearCover}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                title="Remove current cover"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <div className="text-xs">
            <p className="font-medium text-foreground">Current Event Cover Photo</p>
            <p className="text-[11px] text-muted-foreground">
              Select new photos below to replace or add more photos to this event.
            </p>
          </div>
        </div>
      )}

      {removeExistingCover && selectedFiles.length === 0 && (
        <p className="text-[11px] text-amber-600">
          Existing cover image will be removed upon saving.
        </p>
      )}

      <div>
        <input
          ref={inputRef}
          id="ev-cover-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInputChange}
          disabled={disabled || selectedFiles.length >= MAX_IMAGE_UPLOAD_COUNT}
          className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/80 disabled:opacity-50"
        />
      </div>

      <EventImagePreviewGrid
        files={selectedFiles}
        coverIndex={coverIndex}
        onSetCoverIndex={onSetCoverIndex}
        onRemoveFile={onRemoveFile}
        disabled={disabled}
      />
    </div>
  );
}
