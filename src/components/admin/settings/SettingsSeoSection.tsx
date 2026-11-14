interface SettingsSeoSectionProps {
  defaultSeoTitleEn: string;
  defaultSeoTitleTe: string;
  defaultSeoDescriptionEn: string;
  defaultSeoDescriptionTe: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function SettingsSeoSection({
  defaultSeoTitleEn,
  defaultSeoTitleTe,
  defaultSeoDescriptionEn,
  defaultSeoDescriptionTe,
  onChange,
}: SettingsSeoSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
      <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
        Default SEO Metadata
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Default titles and search descriptions used when page-specific SEO overrides are omitted.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="defaultSeoTitleEn" className="block text-xs font-medium text-foreground">
            Default SEO Title (English)
          </label>
          <input
            id="defaultSeoTitleEn"
            name="defaultSeoTitleEn"
            type="text"
            required
            value={defaultSeoTitleEn}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="defaultSeoTitleTe" className="block text-xs font-medium text-foreground">
            Default SEO Title (Telugu)
          </label>
          <input
            id="defaultSeoTitleTe"
            name="defaultSeoTitleTe"
            type="text"
            required
            value={defaultSeoTitleTe}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="defaultSeoDescriptionEn"
            className="block text-xs font-medium text-foreground"
          >
            Default SEO Description (English)
          </label>
          <textarea
            id="defaultSeoDescriptionEn"
            name="defaultSeoDescriptionEn"
            rows={2}
            required
            value={defaultSeoDescriptionEn}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="defaultSeoDescriptionTe"
            className="block text-xs font-medium text-foreground"
          >
            Default SEO Description (Telugu)
          </label>
          <textarea
            id="defaultSeoDescriptionTe"
            name="defaultSeoDescriptionTe"
            rows={2}
            required
            value={defaultSeoDescriptionTe}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>
    </section>
  );
}
