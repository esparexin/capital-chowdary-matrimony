import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { contentSections, mediaAssets } from "@/db/schema";

export interface HeroHighlight {
  title: string;
  description: string;
}

export interface HeroImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface HeroContentData {
  title: string;
  teluguIntro: string;
  description: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaLabel: string;
  associationName: string;
  associationDetail: string;
  highlights: readonly HeroHighlight[];
  image: HeroImageAsset;
}

const DEFAULT_HIGHLIGHTS: readonly HeroHighlight[] = [
  {
    title: "Andhra Pradesh & Telangana",
    description: "Alliances across both Telugu states",
  },
];

export const DEFAULT_HERO_IMAGE: HeroImageAsset = {
  src: "https://res.cloudinary.com/mmdlzn5o/image/upload/v1794550697/capital-chowdary-matrimony/banners/q0tqhz8dnbcgukqvxk5p.jpg",
  alt: "Traditional Telugu wedding ceremony in burgundy and ivory silk attire",
  width: 1200,
  height: 896,
};

export const DEFAULT_HERO_CONTENT: HeroContentData = {
  title: "Trusted marriage alliances for Kamma families",
  teluguIntro: "చౌదరి (కమ్మ) కులము వారికి చక్కటి పెళ్ళి సంబంధములు కుదర్చబడును & మ్యారేజ్ ఈవెంట్స్ చేయబడును.",
  description:
    "Software employees, doctors, NRIs, business and government employees, divorced and late marriages — alliances across Andhra Pradesh and Telangana from our office in Narasaraopet.",
  primaryCtaHref: "/register",
  primaryCtaLabel: "Register",
  secondaryCtaHref: "/contact",
  secondaryCtaLabel: "Contact Us",
  associationName: "Kamma Welfare Association",
  associationDetail: "Andhra & Telangana · Regd. No: AP-07 91-058-0756579",
  highlights: DEFAULT_HIGHLIGHTS,
  image: DEFAULT_HERO_IMAGE,
};

const heroHighlightSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const heroMetadataSchema = z.object({
  primaryCtaHref: z.string().trim().min(1).optional(),
  primaryCtaLabelEn: z.string().trim().min(1).optional(),
  secondaryCtaHref: z.string().trim().min(1).optional(),
  secondaryCtaLabelEn: z.string().trim().min(1).optional(),
  associationName: z.string().trim().min(1).optional(),
  associationDetail: z.string().trim().min(1).optional(),
  highlights: z.array(heroHighlightSchema).optional(),
  fallbackImageAltEn: z.string().trim().min(1).optional(),
});

interface HeroSectionRecord {
  titleEn?: string | null;
  titleTe?: string | null;
  bodyEn?: string | null;
  metadataJson?: string | null;
}

interface HeroMediaRecord {
  secureUrl?: string | null;
  altEn?: string | null;
  width?: number | null;
  height?: number | null;
}

function pickNonEmpty(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function parseHeroMetadata(rawJson: string | null | undefined) {
  if (!rawJson) return null;
  try {
    const parsedJson: unknown = JSON.parse(rawJson);
    const result = heroMetadataSchema.safeParse(parsedJson);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Merges D1 `content_sections` (`sec-home-hero`) and `media_assets` records with approved defaults
 * so every hero copy field and image remains editable via Admin Homepage CMS.
 */
export function resolveHeroContent(
  section?: HeroSectionRecord | null,
  media?: HeroMediaRecord | null,
): HeroContentData {
  const meta = parseHeroMetadata(section?.metadataJson);
  const highlights =
    meta?.highlights && meta.highlights.length > 0
      ? meta.highlights
      : DEFAULT_HERO_CONTENT.highlights;

  const hasCmsImage =
    Boolean(media?.secureUrl) && media!.secureUrl!.startsWith("https://res.cloudinary.com/");

  const image: HeroImageAsset = hasCmsImage
    ? {
        src: media!.secureUrl!,
        alt: pickNonEmpty(
          media?.altEn,
          pickNonEmpty(meta?.fallbackImageAltEn, DEFAULT_HERO_IMAGE.alt),
        ),
        width: media?.width && media.width > 0 ? media.width : DEFAULT_HERO_IMAGE.width,
        height: media?.height && media.height > 0 ? media.height : DEFAULT_HERO_IMAGE.height,
      }
    : {
        ...DEFAULT_HERO_IMAGE,
        alt: pickNonEmpty(meta?.fallbackImageAltEn, DEFAULT_HERO_IMAGE.alt),
      };

  return {
    title: pickNonEmpty(section?.titleEn, DEFAULT_HERO_CONTENT.title),
    teluguIntro: pickNonEmpty(section?.titleTe, DEFAULT_HERO_CONTENT.teluguIntro),
    description: pickNonEmpty(section?.bodyEn, DEFAULT_HERO_CONTENT.description),
    primaryCtaHref: pickNonEmpty(meta?.primaryCtaHref, DEFAULT_HERO_CONTENT.primaryCtaHref),
    primaryCtaLabel: pickNonEmpty(meta?.primaryCtaLabelEn, DEFAULT_HERO_CONTENT.primaryCtaLabel),
    secondaryCtaHref: pickNonEmpty(meta?.secondaryCtaHref, DEFAULT_HERO_CONTENT.secondaryCtaHref),
    secondaryCtaLabel: pickNonEmpty(
      meta?.secondaryCtaLabelEn,
      DEFAULT_HERO_CONTENT.secondaryCtaLabel,
    ),
    associationName: pickNonEmpty(meta?.associationName, DEFAULT_HERO_CONTENT.associationName),
    associationDetail: pickNonEmpty(
      meta?.associationDetail,
      DEFAULT_HERO_CONTENT.associationDetail,
    ),
    highlights,
    image,
  };
}

/**
 * Loads the published hero section and optional media asset from D1,
 * falling back cleanly to the approved defaults if D1 is unmigrated or unseeded.
 */
export async function getHomepageHeroContent(): Promise<HeroContentData> {
  try {
    const db = await getDatabase();
    const rows = await db
      .select({
        titleEn: contentSections.titleEn,
        titleTe: contentSections.titleTe,
        bodyEn: contentSections.bodyEn,
        metadataJson: contentSections.metadataJson,
        mediaSecureUrl: mediaAssets.secureUrl,
        mediaAltEn: mediaAssets.altEn,
        mediaWidth: mediaAssets.width,
        mediaHeight: mediaAssets.height,
      })
      .from(contentSections)
      .leftJoin(mediaAssets, eq(contentSections.mediaAssetId, mediaAssets.id))
      .where(
        and(
          eq(contentSections.pageId, "page-home"),
          eq(contentSections.sectionKey, "hero"),
          eq(contentSections.status, "published"),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      return DEFAULT_HERO_CONTENT;
    }

    return resolveHeroContent(
      {
        titleEn: row.titleEn,
        titleTe: row.titleTe,
        bodyEn: row.bodyEn,
        metadataJson: row.metadataJson,
      },
      row.mediaSecureUrl
        ? {
            secureUrl: row.mediaSecureUrl,
            altEn: row.mediaAltEn,
            width: row.mediaWidth,
            height: row.mediaHeight,
          }
        : null,
    );
  } catch {
    return DEFAULT_HERO_CONTENT;
  }
}
