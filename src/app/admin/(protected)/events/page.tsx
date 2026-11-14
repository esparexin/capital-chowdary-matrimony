import { asc, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { marriageEvents, mediaAssets } from "@/db/schema";
import { AdminEventsManager } from "@/components/admin/AdminEventsManager";
import type { AdminMarriageEventRecord } from "@/app/api/admin/events/route";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  let initialEvents: AdminMarriageEventRecord[] = [];

  try {
    const db = await getDatabase();
    initialEvents = await db
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
        coverMediaAssetId: marriageEvents.coverMediaAssetId,
        sortOrder: marriageEvents.sortOrder,
        status: marriageEvents.status,
        publishedAt: marriageEvents.publishedAt,
        createdAt: marriageEvents.createdAt,
        updatedAt: marriageEvents.updatedAt,
        coverUrl: mediaAssets.secureUrl,
        coverPublicId: mediaAssets.cloudinaryPublicId,
        coverWidth: mediaAssets.width,
        coverHeight: mediaAssets.height,
      })
      .from(marriageEvents)
      .leftJoin(mediaAssets, eq(marriageEvents.coverMediaAssetId, mediaAssets.id))
      .orderBy(asc(marriageEvents.sortOrder), desc(marriageEvents.createdAt));
  } catch (err) {
    console.error("Failed to fetch initial events in admin:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Events &amp; Gatherings
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Marriage Events
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage upcoming matrimonial gatherings, parichaya vedika schedules, and Cloudinary cover
          imagery.
        </p>
      </div>

      <AdminEventsManager initialEvents={initialEvents} />
    </div>
  );
}
