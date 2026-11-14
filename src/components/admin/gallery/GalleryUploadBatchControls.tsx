"use client";

import type { AvailableEventOption } from "@/components/admin/AdminGalleryManager";

interface GalleryUploadBatchControlsProps {
  defaultCaptionEn: string;
  defaultCaptionTe: string;
  eventId: string;
  status: "published" | "draft";
  availableEvents?: AvailableEventOption[];
  onCaptionEnChange: (val: string) => void;
  onCaptionTeChange: (val: string) => void;
  onEventIdChange: (val: string) => void;
  onStatusChange: (val: "published" | "draft") => void;
}

export function GalleryUploadBatchControls({
  defaultCaptionEn,
  defaultCaptionTe,
  eventId,
  status,
  availableEvents,
  onCaptionEnChange,
  onCaptionTeChange,
  onEventIdChange,
  onStatusChange,
}: GalleryUploadBatchControlsProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <>
      <div>
        <label htmlFor="batch-caption-en" className="block text-xs font-medium text-foreground">
          Default Caption (English)
        </label>
        <input
          id="batch-caption-en"
          type="text"
          value={defaultCaptionEn}
          onChange={(e) => onCaptionEnChange(e.target.value)}
          placeholder="e.g. Marriage Event or Muhurtham Chart"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="batch-caption-te" className="block text-xs font-medium text-foreground">
          Default Caption (Telugu)
        </label>
        <input
          id="batch-caption-te"
          type="text"
          value={defaultCaptionTe}
          onChange={(e) => onCaptionTeChange(e.target.value)}
          placeholder="ఉదా: వివాహ వేడుక లేదా ముహూర్తం వివరాలు"
          className={inputClass}
        />
      </div>

      {availableEvents && availableEvents.length > 0 && (
        <div>
          <label htmlFor="gallery-event" className="block text-xs font-medium text-foreground">
            Associated Marriage Event (Optional)
          </label>
          <select
            id="gallery-event"
            value={eventId}
            onChange={(e) => onEventIdChange(e.target.value)}
            className={inputClass}
          >
            <option value="">None (General Gallery / Couple Photo)</option>
            {availableEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titleEn} ({ev.titleTe})
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="gallery-status" className="block text-xs font-medium text-foreground">
          Visibility
        </label>
        <select
          id="gallery-status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as "published" | "draft")}
          className={inputClass}
        >
          <option value="published">Published (Live immediately)</option>
          <option value="draft">Draft (Admin review)</option>
        </select>
      </div>
    </>
  );
}
