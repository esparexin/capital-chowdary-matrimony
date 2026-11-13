import { asc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { galleryItems, marriageEvents, mediaAssets, pricingPlans } from "@/db/schema";
import { DEFAULT_PRICING_PLANS } from "@/db/seed/default-content";

export interface PublicPricingPlan {
  id: string;
  slug: string;
  categoryEn: string;
  categoryTe: string;
  registrationFeeInr: number;
  maleCommissionInr: number;
  femaleCommissionInr: number;
  validityMonths: number;
  termsEn: string;
  termsTe: string;
}

export interface PublicPricingResult {
  source: "d1" | "d1-unpublished" | "fallback";
  plans: readonly PublicPricingPlan[];
}

export interface PublicMarriageEvent {
  id: string;
  slug: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  locationEn: string;
  locationTe: string;
  eventDate: string | null;
  coverUrl: string | null;
  coverAltEn: string;
  coverWidth: number;
  coverHeight: number;
}

export interface PublicGalleryPhoto {
  id: string;
  captionEn: string;
  captionTe: string;
  imageUrl: string;
  altEn: string;
  altTe: string;
  width: number;
  height: number;
}

export interface PublicEventsAndGalleryResult {
  events: readonly PublicMarriageEvent[];
  gallery: readonly PublicGalleryPhoto[];
}

export function formatInrAmount(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Fetches published pricing plans from D1. Honors admin unpublishing when rows exist in D1 without published status,
 * and falls back cleanly to baseline approved plans if D1 is unmigrated or unseeded.
 */
export async function getPublicPricingPlans(): Promise<PublicPricingResult> {
  try {
    const db = await getDatabase();
    const publishedRows = await db
      .select({
        id: pricingPlans.id,
        slug: pricingPlans.slug,
        categoryEn: pricingPlans.categoryEn,
        categoryTe: pricingPlans.categoryTe,
        registrationFeeInr: pricingPlans.registrationFeeInr,
        maleCommissionInr: pricingPlans.maleCommissionInr,
        femaleCommissionInr: pricingPlans.femaleCommissionInr,
        validityMonths: pricingPlans.validityMonths,
        termsEn: pricingPlans.termsEn,
        termsTe: pricingPlans.termsTe,
      })
      .from(pricingPlans)
      .where(eq(pricingPlans.status, "published"))
      .orderBy(asc(pricingPlans.sortOrder));

    if (publishedRows.length > 0) {
      return { source: "d1", plans: publishedRows };
    }

    const [anyRow] = await db.select({ id: pricingPlans.id }).from(pricingPlans).limit(1);
    if (anyRow) {
      return { source: "d1-unpublished", plans: [] };
    }

    return {
      source: "fallback",
      plans: DEFAULT_PRICING_PLANS.map((plan) => ({
        ...plan,
        validityMonths: plan.validityMonths ?? 11,
      })),
    };
  } catch {
    return {
      source: "fallback",
      plans: DEFAULT_PRICING_PLANS.map((plan) => ({
        ...plan,
        validityMonths: plan.validityMonths ?? 11,
      })),
    };
  }
}

/**
 * Fetches published marriage events and gallery images from D1.
 * Never fabricates events or photos; returns empty arrays when none are published yet.
 */
export async function getPublicEventsAndGallery(): Promise<PublicEventsAndGalleryResult> {
  try {
    const db = await getDatabase();

    const eventRows = await db
      .select({
        id: marriageEvents.id,
        slug: marriageEvents.slug,
        titleEn: marriageEvents.titleEn,
        titleTe: marriageEvents.titleTe,
        descriptionEn: marriageEvents.descriptionEn,
        descriptionTe: marriageEvents.descriptionTe,
        locationEn: marriageEvents.locationEn,
        locationTe: marriageEvents.locationTe,
        eventDate: marriageEvents.eventDate,
        coverUrl: mediaAssets.secureUrl,
        coverAltEn: mediaAssets.altEn,
        coverWidth: mediaAssets.width,
        coverHeight: mediaAssets.height,
      })
      .from(marriageEvents)
      .leftJoin(mediaAssets, eq(marriageEvents.coverMediaAssetId, mediaAssets.id))
      .where(eq(marriageEvents.status, "published"))
      .orderBy(asc(marriageEvents.sortOrder));

    const galleryRows = await db
      .select({
        id: galleryItems.id,
        captionEn: galleryItems.captionEn,
        captionTe: galleryItems.captionTe,
        imageUrl: mediaAssets.secureUrl,
        altEn: mediaAssets.altEn,
        altTe: mediaAssets.altTe,
        width: mediaAssets.width,
        height: mediaAssets.height,
      })
      .from(galleryItems)
      .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
      .where(eq(galleryItems.status, "published"))
      .orderBy(asc(galleryItems.sortOrder));

    return {
      events: eventRows.map((row) => ({
        id: row.id,
        slug: row.slug,
        titleEn: row.titleEn,
        titleTe: row.titleTe,
        descriptionEn: row.descriptionEn,
        descriptionTe: row.descriptionTe,
        locationEn: row.locationEn,
        locationTe: row.locationTe,
        eventDate: row.eventDate,
        coverUrl: row.coverUrl,
        coverAltEn: row.coverAltEn || row.titleEn,
        coverWidth: row.coverWidth && row.coverWidth > 0 ? row.coverWidth : 800,
        coverHeight: row.coverHeight && row.coverHeight > 0 ? row.coverHeight : 600,
      })),
      gallery: galleryRows.map((row) => ({
        id: row.id,
        captionEn: row.captionEn,
        captionTe: row.captionTe,
        imageUrl: row.imageUrl,
        altEn: row.altEn || row.captionEn || "Capital Chowdary Matrimony event photograph",
        altTe: row.altTe || row.captionTe || "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ వేడుక ఫోటో",
        width: row.width && row.width > 0 ? row.width : 800,
        height: row.height && row.height > 0 ? row.height : 600,
      })),
    };
  } catch {
    return { events: [], gallery: [] };
  }
}
