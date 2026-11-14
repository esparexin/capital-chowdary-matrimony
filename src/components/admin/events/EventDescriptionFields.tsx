"use client";

import type { EventFormData } from "./AdminEventForm";

interface EventDescriptionFieldsProps {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
}

export function EventDescriptionFields({ formData, setFormData }: EventDescriptionFieldsProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <>
      <div className="sm:col-span-2">
        <label htmlFor="ev-desc-en" className="block text-xs font-medium text-foreground">
          Description (English)
        </label>
        <textarea
          id="ev-desc-en"
          rows={2}
          value={formData.descriptionEn}
          onChange={(e) => setFormData((p) => ({ ...p, descriptionEn: e.target.value }))}
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="ev-desc-te" className="block text-xs font-medium text-foreground">
          Description (Telugu)
        </label>
        <textarea
          id="ev-desc-te"
          rows={2}
          value={formData.descriptionTe}
          onChange={(e) => setFormData((p) => ({ ...p, descriptionTe: e.target.value }))}
          className={inputClass}
        />
      </div>
    </>
  );
}
