interface SettingsContactSectionProps {
  phoneNumber: string;
  whatsappNumber: string;
  contactEmail: string;
  mapUrl: string;
  addressEn: string;
  addressTe: string;
  isContactVerified: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function SettingsContactSection({
  phoneNumber,
  whatsappNumber,
  contactEmail,
  mapUrl,
  addressEn,
  addressTe,
  isContactVerified,
  onChange,
}: SettingsContactSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Office & Contact Channels
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Verified telephone, WhatsApp inquiry channel, email, and Google Maps location.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phoneNumber" className="block text-xs font-medium text-foreground">
            Official Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            required
            value={phoneNumber}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="whatsappNumber" className="block text-xs font-medium text-foreground">
            Official WhatsApp Number
          </label>
          <input
            id="whatsappNumber"
            name="whatsappNumber"
            type="text"
            required
            value={whatsappNumber}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-xs font-medium text-foreground">
            Contact Email Address
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            value={contactEmail}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="mapUrl" className="block text-xs font-medium text-foreground">
            Google Maps Search / Direction URL
          </label>
          <input
            id="mapUrl"
            name="mapUrl"
            type="url"
            value={mapUrl}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="addressEn" className="block text-xs font-medium text-foreground">
            Office Address (English)
          </label>
          <textarea
            id="addressEn"
            name="addressEn"
            rows={2}
            value={addressEn}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="addressTe" className="block text-xs font-medium text-foreground">
            Office Address (Telugu)
          </label>
          <textarea
            id="addressTe"
            name="addressTe"
            rows={2}
            value={addressTe}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          id="isContactVerified"
          name="isContactVerified"
          type="checkbox"
          checked={isContactVerified}
          onChange={onChange}
          className="size-4 rounded border-input text-primary focus:ring-primary"
        />
        <label htmlFor="isContactVerified" className="text-xs font-medium text-foreground">
          Mark contact details as verified (enables database overrides on public pages)
        </label>
      </div>
    </section>
  );
}
