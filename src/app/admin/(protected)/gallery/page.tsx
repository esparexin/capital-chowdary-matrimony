import { asc, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { galleryItems, marriageEvents, mediaAssets } from "@/db/schema";
import {
  AdminGalleryManager,
  type AvailableEventOption,
} from "@/components/admin/AdminGalleryManager";
import type { AdminGalleryItemRecord } from "@/app/api/admin/gallery/route";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  let initialItems: AdminGalleryItemRecord[] = [];
  let availableEvents: AvailableEventOption[] = [];

  try {
    const db = await getDatabase();
    const [items, events] = await Promise.all([
      db
        .select({
          id: galleryItems.id,
          mediaAssetId: galleryItems.mediaAssetId,
          eventId: galleryItems.eventId,
          captionEn: galleryItems.captionEn,
          captionTe: galleryItems.captionTe,
          sortOrder: galleryItems.sortOrder,
          status: galleryItems.status,
          publishedAt: galleryItems.publishedAt,
          createdAt: galleryItems.createdAt,
          secureUrl: mediaAssets.secureUrl,
          cloudinaryPublicId: mediaAssets.cloudinaryPublicId,
          width: mediaAssets.width,
          height: mediaAssets.height,
          bytes: mediaAssets.bytes,
          format: mediaAssets.format,
        })
        .from(galleryItems)
        .innerJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
        .orderBy(asc(galleryItems.sortOrder), desc(galleryItems.createdAt)),
      db
        .select({
          id: marriageEvents.id,
          titleEn: marriageEvents.titleEn,
          titleTe: marriageEvents.titleTe,
        })
        .from(marriageEvents)
        .orderBy(asc(marriageEvents.sortOrder)),
    ]);
    initialItems = items;
    availableEvents = events;
  } catch (err) {
    console.error("Failed to fetch initial gallery items:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Content Management
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Photo Gallery &amp; Event Media
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and manage photos for marriage events, muhurtham schedules, and community gallery.
        </p>
      </div>

      <AdminGalleryManager initialItems={initialItems} availableEvents={availableEvents} />
    </div>
  );
}
