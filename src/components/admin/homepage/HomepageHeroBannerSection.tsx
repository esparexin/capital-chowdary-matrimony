import Image from "next/image";
import { Image as ImageIcon, X } from "lucide-react";

interface HomepageHeroBannerSectionProps {
  status: "draft" | "published";
  onStatusChange: (status: "draft" | "published") => void;
  bannerPreviewUrl: string | null;
  onClearBanner: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function HomepageHeroBannerSection({
  status,
  onStatusChange,
  bannerPreviewUrl,
  onClearBanner,
  onFileChange,
}: HomepageHeroBannerSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          Banner Media &amp; Status
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hero banner photo stored on Cloudinary and public publication toggle.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="hero-status" className="block text-xs font-medium text-foreground">
            Hero Section Visibility
          </label>
          <select
            id="hero-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as "draft" | "published")}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="published">Published (Live on Website)</option>
            <option value="draft">Draft (Fallback to Baseline Defaults)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-foreground">
            Hero Banner Image (Cloudinary)
          </label>

          <div className="mt-2 flex flex-wrap items-center gap-4">
            {bannerPreviewUrl ? (
              <div className="relative aspect-16/10 w-44 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={bannerPreviewUrl}
                  alt="Hero banner preview"
                  fill
                  className="object-cover"
                  sizes="176px"
                />
                <button
                  type="button"
                  onClick={onClearBanner}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div className="flex aspect-16/10 w-44 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                <ImageIcon className="size-8 stroke-1" />
              </div>
            )}

            <div className="flex-1">
              <input
                id="hero-banner-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFileChange}
                className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/80"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Uploads directly to Cloudinary folder <span className="font-mono">banners</span>.
                Recommended size: 1200x896px. Max 5MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
