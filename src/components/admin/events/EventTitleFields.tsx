"use client";

import type { EventFormData } from "./AdminEventForm";

interface EventTitleFieldsProps {
  formData: EventFormData;
  setFormData: React.Dispatch<React.SetStateAction<EventFormData>>;
}

export function EventTitleFields({ formData, setFormData }: EventTitleFieldsProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <>
      <div>
        <label htmlFor="ev-title-en" className="block text-xs font-medium text-foreground">
          Event Title (English)
        </label>
        <input
          id="ev-title-en"
          type="text"
          required
          value={formData.titleEn}
          onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
          placeholder="e.g. Narasaraopet Parichaya Vedika"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="ev-title-te" className="block text-xs font-medium text-foreground">
          Event Title (Telugu)
        </label>
        <input
          id="ev-title-te"
          type="text"
          required
          value={formData.titleTe}
          onChange={(e) => setFormData((p) => ({ ...p, titleTe: e.target.value }))}
          placeholder="e.g. నరసరావుపేట పరిచయ వేదిక"
          className={inputClass}
        />
      </div>
    </>
  );
}
