"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { PublicGalleryPhoto } from "@/features/cms/public-offerings-repo";

interface GalleryPhotoGridProps {
  photos: readonly PublicGalleryPhoto[];
  isTelugu?: boolean;
}

/**
 * Mobile-first responsive gallery grid with native modal lightbox preview.
 */
export function GalleryPhotoGrid({ photos, isTelugu = false }: GalleryPhotoGridProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const activePhoto = selectedIdx !== null ? photos[selectedIdx] : null;

  const openLightbox = (idx: number) => {
    setSelectedIdx(idx);
    dialogRef.current?.showModal();
  };

  const closeLightbox = () => {
    dialogRef.current?.close();
    setSelectedIdx(null);
  };

  const showPrev = useCallback(() => {
    setSelectedIdx((prev) =>
      prev === null || photos.length <= 1 ? prev : (prev - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  const showNext = useCallback(() => {
    setSelectedIdx((prev) =>
      prev === null || photos.length <= 1 ? prev : (prev + 1) % photos.length,
    );
  }, [photos.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, showPrev, showNext]);

  if (photos.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, idx) => {
          const caption = isTelugu ? photo.captionTe : photo.captionEn;
          const altText = isTelugu ? photo.altTe : photo.altEn;

          return (
            <figure
              key={photo.id}
              className="group overflow-hidden rounded-xl border border-[#C5A15A]/45 bg-white shadow-2xs transition-shadow hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => openLightbox(idx)}
                aria-label={`View photo ${idx + 1}: ${caption || altText}`}
                className="relative block aspect-4/3 w-full overflow-hidden bg-[#FAF8F3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
              >
                <Image
                  src={photo.imageUrl}
                  alt={altText || caption || "Gallery image"}
                  width={photo.width || 800}
                  height={photo.height || 600}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <span className="absolute right-2.5 bottom-2.5 inline-flex size-8 items-center justify-center rounded-full bg-[#70243B]/80 text-[#FAF8F3] opacity-0 shadow-sm backdrop-blur-xs transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  <ZoomIn className="size-4" aria-hidden="true" />
                </span>
              </button>
              {caption ? (
                <figcaption className="p-3 text-xs leading-relaxed text-[#3D272E]">
                  {caption}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setSelectedIdx(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeLightbox();
        }}
        className="m-auto max-h-[95dvh] max-w-[95dvw] rounded-2xl border border-[#C5A15A]/60 bg-[#FAF8F3] p-0 text-[#2F1D22] shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-xs md:max-w-3xl"
      >
        {activePhoto && selectedIdx !== null ? (
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b border-[#C5A15A]/30 bg-white px-4 py-2.5">
              <span className="text-xs font-semibold text-[#70243B]">
                {isTelugu ? "ఫోటో" : "Photo"} {selectedIdx + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                aria-label="Close photo preview"
                className="inline-flex size-8 items-center justify-center rounded-lg text-[#593E46] transition-colors hover:bg-[#FAF8F3] hover:text-[#70243B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative aspect-4/3 w-full overflow-hidden bg-black/5 sm:aspect-16/10">
              <Image
                src={activePhoto.imageUrl}
                alt={
                  (isTelugu ? activePhoto.altTe : activePhoto.altEn) ||
                  (isTelugu ? activePhoto.captionTe : activePhoto.captionEn) ||
                  "Gallery preview"
                }
                width={activePhoto.width || 1200}
                height={activePhoto.height || 900}
                className="h-full w-full object-contain"
                priority
              />

              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={showPrev}
                    aria-label="Previous photo"
                    className="absolute top-1/2 left-2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#FAF8F3]/90 text-[#70243B] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next photo"
                    className="absolute top-1/2 right-2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#FAF8F3]/90 text-[#70243B] shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70243B]"
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>

            {(isTelugu ? activePhoto.captionTe : activePhoto.captionEn) ? (
              <p className="border-t border-[#C5A15A]/25 bg-white p-3 text-center text-xs leading-relaxed text-[#3D272E] sm:text-sm">
                {isTelugu ? activePhoto.captionTe : activePhoto.captionEn}
              </p>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
