interface HeroFormData {
  titleEn: string;
  titleTe: string;
  bodyEn: string;
  primaryCtaLabelEn: string;
  primaryCtaHref: string;
  secondaryCtaLabelEn: string;
  secondaryCtaHref: string;
  associationName: string;
  associationDetail: string;
  status: "draft" | "published";
}

interface HomepageHeroContentSectionProps {
  formData: HeroFormData;
  setFormData: React.Dispatch<React.SetStateAction<HeroFormData>>;
}

export function HomepageHeroContentSection({
  formData,
  setFormData,
}: HomepageHeroContentSectionProps) {
  const inputClass =
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary";

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Hero Heading &amp; Introduction
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Topmost heading, verified Telugu introduction banner, and primary description on the
            public homepage.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="hero-title-en" className="block text-xs font-medium text-foreground">
              Main Heading (English)
            </label>
            <input
              id="hero-title-en"
              type="text"
              required
              value={formData.titleEn}
              onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="hero-title-te" className="block text-xs font-medium text-foreground">
              Telugu Introduction Banner
            </label>
            <textarea
              id="hero-title-te"
              rows={2}
              required
              value={formData.titleTe}
              onChange={(e) => setFormData((p) => ({ ...p, titleTe: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="hero-body-en" className="block text-xs font-medium text-foreground">
              Description (English)
            </label>
            <textarea
              id="hero-body-en"
              rows={3}
              required
              value={formData.bodyEn}
              onChange={(e) => setFormData((p) => ({ ...p, bodyEn: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Association Details &amp; Calls to Action
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Welfare association affiliation details and hero button configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="assoc-name" className="block text-xs font-medium text-foreground">
              Association Name
            </label>
            <input
              id="assoc-name"
              type="text"
              required
              value={formData.associationName}
              onChange={(e) => setFormData((p) => ({ ...p, associationName: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="assoc-detail" className="block text-xs font-medium text-foreground">
              Association Registration Details
            </label>
            <input
              id="assoc-detail"
              type="text"
              required
              value={formData.associationDetail}
              onChange={(e) => setFormData((p) => ({ ...p, associationDetail: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="primary-cta-label"
              className="block text-xs font-medium text-foreground"
            >
              Primary Button Label
            </label>
            <input
              id="primary-cta-label"
              type="text"
              required
              value={formData.primaryCtaLabelEn}
              onChange={(e) => setFormData((p) => ({ ...p, primaryCtaLabelEn: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="primary-cta-href" className="block text-xs font-medium text-foreground">
              Primary Button URL
            </label>
            <input
              id="primary-cta-href"
              type="text"
              required
              value={formData.primaryCtaHref}
              onChange={(e) => setFormData((p) => ({ ...p, primaryCtaHref: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="secondary-cta-label"
              className="block text-xs font-medium text-foreground"
            >
              Secondary Button Label
            </label>
            <input
              id="secondary-cta-label"
              type="text"
              required
              value={formData.secondaryCtaLabelEn}
              onChange={(e) => setFormData((p) => ({ ...p, secondaryCtaLabelEn: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="secondary-cta-href"
              className="block text-xs font-medium text-foreground"
            >
              Secondary Button URL
            </label>
            <input
              id="secondary-cta-href"
              type="text"
              required
              value={formData.secondaryCtaHref}
              onChange={(e) => setFormData((p) => ({ ...p, secondaryCtaHref: e.target.value }))}
              className={inputClass}
            />
          </div>
        </div>
      </section>
    </>
  );
}
