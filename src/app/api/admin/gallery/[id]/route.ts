import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, galleryItems, mediaAssets } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/cloudinary-destroy";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { updateGalleryItemSchema } from "@/lib/validations/admin-gallery-schema";
import type { ApiResponse } from "@/types/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<{ updated: boolean }>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const { id } = await params;
    const rawBody = await request.json();
    const parsed = updateGalleryItemSchema.parse(rawBody);

    const db = await getDatabase();
    const [existing] = await db.select().from(galleryItems).where(eq(galleryItems.id, id)).limit(1);

    if (!existing) {
      throw new AppError("Gallery item not found.", 404, "NOT_FOUND");
    }

    const updates: Partial<typeof galleryItems.$inferInsert> = {};
    if (parsed.status !== undefined) {
      updates.status = parsed.status;
      updates.publishedAt = parsed.status === "published" ? new Date().toISOString() : null;
    }
    if (parsed.captionEn !== undefined) updates.captionEn = parsed.captionEn;
    if (parsed.captionTe !== undefined) updates.captionTe = parsed.captionTe;
    if (parsed.sortOrder !== undefined) updates.sortOrder = parsed.sortOrder;
    if (parsed.eventId !== undefined) {
      updates.eventId = parsed.eventId?.trim() ? parsed.eventId.trim() : null;
    }

    await db.update(galleryItems).set(updates).where(eq(galleryItems.id, id));

    const action =
      parsed.status && parsed.status !== existing.status
        ? parsed.status === "published"
          ? "publish"
          : "unpublish"
        : "update";

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "gallery_item",
      entityId: id,
      action,
      snapshotJson: JSON.stringify({ ...existing, ...updates }),
      changedByAdminId: admin.id,
      createdAt: new Date().toISOString(),
    });

    const response = NextResponse.json<ApiResponse<{ updated: boolean }>>({
      ok: true,
      data: { updated: true },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/gallery/[id]");
    const response = NextResponse.json<ApiResponse<{ updated: boolean }>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const { id } = await params;

    const db = await getDatabase();
    const [existing] = await db
      .select({
        id: galleryItems.id,
        mediaAssetId: galleryItems.mediaAssetId,
        cloudinaryPublicId: mediaAssets.cloudinaryPublicId,
      })
      .from(galleryItems)
      .leftJoin(mediaAssets, eq(galleryItems.mediaAssetId, mediaAssets.id))
      .where(eq(galleryItems.id, id))
      .limit(1);

    if (!existing) {
      throw new AppError("Gallery item not found.", 404, "NOT_FOUND");
    }

    if (existing.cloudinaryPublicId) {
      try {
        await deleteCloudinaryAsset(existing.cloudinaryPublicId);
      } catch (cldErr) {
        console.warn("Cloudinary asset deletion warning:", cldErr);
      }
    }

    await db.delete(galleryItems).where(eq(galleryItems.id, id));
    if (existing.mediaAssetId) {
      await db.delete(mediaAssets).where(eq(mediaAssets.id, existing.mediaAssetId));
    }

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "gallery_item",
      entityId: id,
      action: "delete",
      snapshotJson: JSON.stringify(existing),
      changedByAdminId: admin.id,
      createdAt: new Date().toISOString(),
    });

    const response = NextResponse.json<ApiResponse<{ deleted: boolean }>>({
      ok: true,
      data: { deleted: true },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/gallery/[id]");
    const response = NextResponse.json<ApiResponse<{ deleted: boolean }>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
