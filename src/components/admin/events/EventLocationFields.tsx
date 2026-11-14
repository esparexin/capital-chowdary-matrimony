"use client";

import type { EventFormData } from "./AdminEventForm";

interface EventLocationFieldsProps {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
}

export function EventLocationFields({ formData, setFormData }: EventLocationFieldsProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <>
      <div>
        <label htmlFor="ev-date" className="block text-xs font-medium text-foreground">
          Event Date (Optional)
        </label>
        <input
          id="ev-date"
          type="text"
          value={formData.eventDate}
          onChange={(e) => setFormData((p) => ({ ...p, eventDate: e.target.value }))}
          placeholder="e.g. 15 December 2026 or 2026-12-15"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="ev-loc-en" className="block text-xs font-medium text-foreground">
          Location (English)
        </label>
        <input
          id="ev-loc-en"
          type="text"
          value={formData.locationEn}
          onChange={(e) => setFormData((p) => ({ ...p, locationEn: e.target.value }))}
          placeholder="e.g. Kamma Kalyana Mandapam, Narasaraopet"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="ev-loc-te" className="block text-xs font-medium text-foreground">
          Location (Telugu)
        </label>
        <input
          id="ev-loc-te"
          type="text"
          value={formData.locationTe}
          onChange={(e) => setFormData((p) => ({ ...p, locationTe: e.target.value }))}
          placeholder="e.g. కమ్మ కళ్యాణ మండపం, నరసరావుపేట"
          className={inputClass}
        />
      </div>
    </>
  );
}
