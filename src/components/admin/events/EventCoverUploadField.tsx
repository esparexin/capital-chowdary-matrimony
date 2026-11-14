"use client";

import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";

interface EventCoverUploadFieldProps {
  coverPreviewUrl: string | null;
  removeExistingCover: boolean;
  onClearCover: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EventCoverUploadField({
  coverPreviewUrl,
  removeExistingCover,
  onClearCover,
  onFileChange,
}: EventCoverUploadFieldProps) {
  return (
    <div className="sm:col-span-2 border-t border-border pt-4">
      <label className="block text-xs font-medium text-foreground">
        Event Cover Image (Cloudinary)
      </label>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        Uploads securely to Cloudinary under the events folder. Max 5MB.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {coverPreviewUrl && !removeExistingCover ? (
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={coverPreviewUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              sizes="96px"
            />
            <button
              type="button"
              onClick={onClearCover}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="flex size-24 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
            <ImageIcon className="size-8 stroke-1" />
          </div>
        )}

        <div className="flex-1">
          <input
            id="ev-cover-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/80"
          />
          {removeExistingCover && (
            <p className="mt-1 text-[11px] text-amber-600">
              Cover image will be removed upon saving.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
