import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentSections, mediaAssets } from "@/db/schema";
import { DEFAULT_HERO_CONTENT } from "@/features/homepage/hero-content";
import { AdminHomepageEditor } from "@/components/admin/AdminHomepageEditor";
import type { AdminHomepageHeroData } from "@/app/api/admin/homepage/route";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  let heroData: AdminHomepageHeroData = {
    id: "sec-home-hero",
    titleEn: DEFAULT_HERO_CONTENT.title,
    titleTe: DEFAULT_HERO_CONTENT.teluguIntro,
    bodyEn: DEFAULT_HERO_CONTENT.description,
    primaryCtaHref: DEFAULT_HERO_CONTENT.primaryCtaHref,
    primaryCtaLabelEn: DEFAULT_HERO_CONTENT.primaryCtaLabel,
    secondaryCtaHref: DEFAULT_HERO_CONTENT.secondaryCtaHref,
    secondaryCtaLabelEn: DEFAULT_HERO_CONTENT.secondaryCtaLabel,
    associationName: DEFAULT_HERO_CONTENT.associationName,
    associationDetail: DEFAULT_HERO_CONTENT.associationDetail,
    highlights: [...DEFAULT_HERO_CONTENT.highlights],
    status: "published",
    mediaAssetId: null,
    bannerUrl: DEFAULT_HERO_CONTENT.image.src,
    bannerPublicId: null,
    bannerWidth: DEFAULT_HERO_CONTENT.image.width,
    bannerHeight: DEFAULT_HERO_CONTENT.image.height,
    bannerAltEn: DEFAULT_HERO_CONTENT.image.alt,
  };

  try {
    const db = await getDatabase();
    const [row] = await db
      .select({
        id: contentSections.id,
        titleEn: contentSections.titleEn,
        titleTe: contentSections.titleTe,
        bodyEn: contentSections.bodyEn,
        metadataJson: contentSections.metadataJson,
        status: contentSections.status,
        mediaAssetId: contentSections.mediaAssetId,
        bannerUrl: mediaAssets.secureUrl,
        bannerPublicId: mediaAssets.cloudinaryPublicId,
        bannerWidth: mediaAssets.width,
        bannerHeight: mediaAssets.height,
        bannerAltEn: mediaAssets.altEn,
      })
      .from(contentSections)
      .leftJoin(mediaAssets, eq(contentSections.mediaAssetId, mediaAssets.id))
      .where(
        and(
          eq(contentSections.pageId, "page-home"),
          eq(contentSections.sectionKey, "hero"),
        ),
      )
      .limit(1);

    if (row) {
      let meta: Record<string, unknown> = {};
      try {
        meta = JSON.parse(row.metadataJson || "{}");
      } catch {
        meta = {};
      }

      heroData = {
        id: row.id,
        titleEn: row.titleEn || DEFAULT_HERO_CONTENT.title,
        titleTe: row.titleTe || DEFAULT_HERO_CONTENT.teluguIntro,
        bodyEn: row.bodyEn || DEFAULT_HERO_CONTENT.description,
        primaryCtaHref:
          typeof meta.primaryCtaHref === "string"
            ? meta.primaryCtaHref
            : DEFAULT_HERO_CONTENT.primaryCtaHref,
        primaryCtaLabelEn:
          typeof meta.primaryCtaLabelEn === "string"
            ? meta.primaryCtaLabelEn
            : DEFAULT_HERO_CONTENT.primaryCtaLabel,
        secondaryCtaHref:
          typeof meta.secondaryCtaHref === "string"
            ? meta.secondaryCtaHref
            : DEFAULT_HERO_CONTENT.secondaryCtaHref,
        secondaryCtaLabelEn:
          typeof meta.secondaryCtaLabelEn === "string"
            ? meta.secondaryCtaLabelEn
            : DEFAULT_HERO_CONTENT.secondaryCtaLabel,
        associationName:
          typeof meta.associationName === "string"
            ? meta.associationName
            : DEFAULT_HERO_CONTENT.associationName,
        associationDetail:
          typeof meta.associationDetail === "string"
            ? meta.associationDetail
            : DEFAULT_HERO_CONTENT.associationDetail,
        highlights: Array.isArray(meta.highlights)
          ? (meta.highlights as Array<{ title: string; description: string }>)
          : [...DEFAULT_HERO_CONTENT.highlights],
        status: (row.status as "draft" | "published") || "published",
        mediaAssetId: row.mediaAssetId,
        bannerUrl: row.bannerUrl || DEFAULT_HERO_CONTENT.image.src,
        bannerPublicId: row.bannerPublicId,
        bannerWidth: row.bannerWidth || DEFAULT_HERO_CONTENT.image.width,
        bannerHeight: row.bannerHeight || DEFAULT_HERO_CONTENT.image.height,
        bannerAltEn: row.bannerAltEn || DEFAULT_HERO_CONTENT.image.alt,
      };
    }
  } catch (err) {
    console.error("Failed to fetch homepage hero in admin:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Content Management
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Homepage Sections &amp; Banners
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage homepage hero copy, Telugu introduction banner, highlights, calls to action, and Cloudinary imagery.
        </p>
      </div>

      <AdminHomepageEditor initialData={heroData} />
    </div>
  );
}
