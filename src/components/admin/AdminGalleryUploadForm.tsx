"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import type { AdminGalleryItemRecord } from "@/app/api/admin/gallery/route";
import type { AvailableEventOption } from "@/components/admin/AdminGalleryManager";
import {
  MAX_IMAGE_UPLOAD_COUNT,
  isDuplicateFile,
  validateBatchImageFiles,
} from "@/lib/validations/image-upload-schema";
import { GalleryUploadBatchControls } from "./gallery/GalleryUploadBatchControls";
import { GalleryUploadQueue } from "./gallery/GalleryUploadQueue";
import {
  executeGalleryBatchUpload,
  type GalleryUploadQueueItem,
  type UploadItemStatus,
} from "./gallery/gallery-upload-service";

interface AdminGalleryUploadFormProps {
  availableEvents?: AvailableEventOption[];
  onUploadSuccess: (item: AdminGalleryItemRecord) => void;
  onError: (error: string | null) => void;
  onSuccess: (message: string | null) => void;
}

export function AdminGalleryUploadForm({
  availableEvents,
  onUploadSuccess,
  onError,
  onSuccess,
}: AdminGalleryUploadFormProps) {
  const [queue, setQueue] = useState<GalleryUploadQueueItem[]>([]);
  const [defaultCaptionEn, setDefaultCaptionEn] = useState("");
  const [defaultCaptionTe, setDefaultCaptionTe] = useState("");
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      queue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [queue]);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0) return;

    const existingRawFiles = queue.map((q) => q.file);
    const nonDuplicates = rawFiles.filter((f) => !isDuplicateFile(f, existingRawFiles));
    const duplicateCount = rawFiles.length - nonDuplicates.length;

    const validation = validateBatchImageFiles(nonDuplicates, queue.length, MAX_IMAGE_UPLOAD_COUNT);

    if (validation.rejected.length > 0 || duplicateCount > 0) {
      const messages: string[] = [];
      if (duplicateCount > 0) messages.push(`${duplicateCount} duplicate file(s) skipped.`);
      if (validation.errorSummary) messages.push(validation.errorSummary);
      onError(messages.join(" "));
    } else {
      onError(null);
    }

    if (validation.accepted.length > 0) {
      const newItems: GalleryUploadQueueItem[] = validation.accepted.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        captionEn: defaultCaptionEn,
        captionTe: defaultCaptionTe,
        status: "idle",
      }));
      setQueue((prev) => [...prev, ...newItems]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveItem = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    queue.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setQueue([]);
    onError(null);
  };

  const handleUpdateItemCaption = (id: string, captionEn: string, captionTe: string) => {
    setQueue((prev) => prev.map((it) => (it.id === id ? { ...it, captionEn, captionTe } : it)));
  };

  const handleStatusChange = (id: string, newStatus: UploadItemStatus, err?: string) => {
    setQueue((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: newStatus, errorMessage: err } : it)),
    );
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pendingItems = queue.filter((it) => it.status !== "success");
    if (pendingItems.length === 0) {
      onError("Please select at least one image file to upload.");
      return;
    }

    setIsUploading(true);
    onError(null);
    onSuccess(null);

    try {
      const summary = await executeGalleryBatchUpload(queue, {
        eventId: eventId ? eventId : undefined,
        status,
        onItemStatusChange: handleStatusChange,
        onItemSuccess: onUploadSuccess,
      });

      if (summary.failed === 0) {
        onSuccess(`Successfully uploaded ${summary.succeeded} image(s) to the gallery.`);
      } else if (summary.succeeded > 0) {
        onError(
          `Uploaded ${summary.succeeded} image(s) successfully, but ${summary.failed} image(s) failed.`,
        );
      } else {
        onError(`All ${summary.failed} upload(s) failed.`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const pendingCount = queue.filter((it) => it.status !== "success").length;

  return (
    <form
      onSubmit={handleUploadSubmit}
      className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4"
    >
      <div>
        <h2 className="text-base font-semibold text-foreground">Upload Gallery Images</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Select up to {MAX_IMAGE_UPLOAD_COUNT} images in a single upload operation. JPEG, PNG, or
          WebP up to 5MB each.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-1 space-y-3">
          <div>
            <label htmlFor="gallery-file" className="block text-xs font-medium text-foreground">
              Select Photos (Up to {MAX_IMAGE_UPLOAD_COUNT})
            </label>
            <input
              ref={fileInputRef}
              id="gallery-file"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFilesSelected}
              disabled={isUploading || queue.length >= MAX_IMAGE_UPLOAD_COUNT}
              className="mt-1 block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground hover:file:opacity-90 disabled:opacity-50"
            />
          </div>

          <GalleryUploadBatchControls
            defaultCaptionEn={defaultCaptionEn}
            defaultCaptionTe={defaultCaptionTe}
            eventId={eventId}
            status={status}
            availableEvents={availableEvents}
            onCaptionEnChange={setDefaultCaptionEn}
            onCaptionTeChange={setDefaultCaptionTe}
            onEventIdChange={setEventId}
            onStatusChange={setStatus}
          />
        </div>

        <div className="flex flex-col justify-end">
          <button
            type="submit"
            disabled={isUploading || pendingCount === 0}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Uploading {pendingCount} image(s)...</span>
              </>
            ) : (
              <>
                <Upload className="size-4" />
                <span>Upload {pendingCount > 0 ? `${pendingCount} Images` : "to Gallery"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <GalleryUploadQueue
        items={queue}
        isUploading={isUploading}
        onRemoveItem={handleRemoveItem}
        onUpdateCaption={handleUpdateItemCaption}
        onClearAll={handleClearAll}
      />
    </form>
  );
}
