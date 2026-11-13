import { asc, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { galleryItems, mediaAssets } from "@/db/schema";
import { AdminGalleryManager } from "@/components/admin/AdminGalleryManager";
import type { AdminGalleryItemRecord } from "@/app/api/admin/gallery/route";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  let initialItems: AdminGalleryItemRecord[] = [];

  try {
    const db = await getDatabase();
    initialItems = await db
      .select({
        id: galleryItems.id,
        mediaAssetId: galleryItems.mediaAssetId,
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
      .orderBy(asc(galleryItems.sortOrder), desc(galleryItems.createdAt));
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
          Photo Gallery & Event Media
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and manage photos for marriage events, muhurtham schedules, and community gallery.
        </p>
      </div>

      <AdminGalleryManager initialItems={initialItems} />
    </div>
  );
}
