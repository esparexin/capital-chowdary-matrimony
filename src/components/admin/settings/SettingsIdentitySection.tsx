interface SettingsIdentitySectionProps {
  businessNameEn: string;
  businessNameTe: string;
  taglineEn: string;
  taglineTe: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function SettingsIdentitySection({
  businessNameEn,
  businessNameTe,
  taglineEn,
  taglineTe,
  onChange,
}: SettingsIdentitySectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Business Identity (Bilingual)
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Official name and motto shown across public website headers, footers, and legal notices.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="businessNameEn" className="block text-xs font-medium text-foreground">
            Business Name (English)
          </label>
          <input
            id="businessNameEn"
            name="businessNameEn"
            type="text"
            required
            value={businessNameEn}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="businessNameTe" className="block text-xs font-medium text-foreground">
            Business Name (Telugu)
          </label>
          <input
            id="businessNameTe"
            name="businessNameTe"
            type="text"
            required
            value={businessNameTe}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="taglineEn" className="block text-xs font-medium text-foreground">
            Motto / Tagline (English)
          </label>
          <input
            id="taglineEn"
            name="taglineEn"
            type="text"
            required
            value={taglineEn}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="taglineTe" className="block text-xs font-medium text-foreground">
            Motto / Tagline (Telugu)
          </label>
          <input
            id="taglineTe"
            name="taglineTe"
            type="text"
            required
            value={taglineTe}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>
    </section>
  );
}
