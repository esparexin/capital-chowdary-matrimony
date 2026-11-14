import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { getDatabase } from "@/db";
import { contentRevisions, marriageEvents, mediaAssets } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/cloudinary-destroy";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { updateMarriageEventSchema } from "@/lib/validations/admin-events-schema";
import type { ApiResponse } from "@/types/api-response";
import type { AdminMarriageEventRecord } from "../route";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const EVENT_FIELDS = {
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
};

async function cleanupOldAsset(db: AppDatabase, publicId: string | null, mediaId: string | null) {
  if (publicId) {
    try {
      await deleteCloudinaryAsset(publicId);
    } catch (err) {
      console.warn("Cloudinary asset deletion warning:", err);
    }
  }
  if (mediaId) {
    await db.delete(mediaAssets).where(eq(mediaAssets.id, mediaId));
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<AdminMarriageEventRecord>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const { id } = await params;
    const rawBody = await request.json();
    const parsed = updateMarriageEventSchema.parse(rawBody);

    const db = await getDatabase();
    const [existing] = await db
      .select({
        ...EVENT_FIELDS,
        oldPublicId: mediaAssets.cloudinaryPublicId,
        oldMediaId: mediaAssets.id,
      })
      .from(marriageEvents)
      .leftJoin(mediaAssets, eq(marriageEvents.coverMediaAssetId, mediaAssets.id))
      .where(eq(marriageEvents.id, id))
      .limit(1);

    if (!existing) {
      throw new AppError("Marriage event not found.", 404, "NOT_FOUND");
    }

    if (parsed.slug && parsed.slug !== existing.slug) {
      const [duplicate] = await db
        .select({ id: marriageEvents.id })
        .from(marriageEvents)
        .where(and(eq(marriageEvents.slug, parsed.slug), ne(marriageEvents.id, id)))
        .limit(1);

      if (duplicate) {
        throw new AppError("An event with this slug already exists.", 409, "CONFLICT");
      }
    }

    const now = new Date().toISOString();
    const updates: Partial<typeof marriageEvents.$inferInsert> = { updatedAt: now };

    const textFields = [
      "slug",
      "titleEn",
      "titleTe",
      "descriptionEn",
      "descriptionTe",
      "locationEn",
      "locationTe",
      "eventDate",
      "sortOrder",
    ] as const;
    textFields.forEach((k) => {
      if (parsed[k] !== undefined) (updates as Record<string, unknown>)[k] = parsed[k];
    });

    if (parsed.status !== undefined) {
      updates.status = parsed.status;
      if (parsed.status === "published" && existing.status !== "published") {
        updates.publishedAt = now;
      } else if (parsed.status === "draft") {
        updates.publishedAt = null;
      }
    }

    if (parsed.secureUrl && parsed.cloudinaryPublicId) {
      const newMediaId = crypto.randomUUID();
      await db.insert(mediaAssets).values({
        id: newMediaId,
        cloudinaryPublicId: parsed.cloudinaryPublicId,
        secureUrl: parsed.secureUrl,
        resourceType: "image",
        format: parsed.format ?? "jpg",
        width: parsed.width ?? 1200,
        height: parsed.height ?? 800,
        bytes: parsed.bytes ?? null,
        altEn: parsed.titleEn ?? existing.titleEn,
        altTe: parsed.titleTe ?? existing.titleTe,
        uploadedByAdminId: admin.id,
      });

      updates.coverMediaAssetId = newMediaId;
      await cleanupOldAsset(db, existing.oldPublicId, existing.oldMediaId);
    } else if (parsed.removeCover && existing.coverMediaAssetId) {
      updates.coverMediaAssetId = null;
      await cleanupOldAsset(db, existing.oldPublicId, existing.oldMediaId);
    }

    await db.update(marriageEvents).set(updates).where(eq(marriageEvents.id, id));

    const action =
      parsed.status && parsed.status !== existing.status
        ? parsed.status === "published"
          ? "publish"
          : "unpublish"
        : "update";

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "marriage_event",
      entityId: id,
      action,
      snapshotJson: JSON.stringify({ ...existing, ...updates }),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const [updatedRow] = await db
      .select(EVENT_FIELDS)
      .from(marriageEvents)
      .leftJoin(mediaAssets, eq(marriageEvents.coverMediaAssetId, mediaAssets.id))
      .where(eq(marriageEvents.id, id))
      .limit(1);

    const response = NextResponse.json<ApiResponse<AdminMarriageEventRecord>>({
      ok: true,
      data: updatedRow!,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/events/[id]");
    const response = NextResponse.json<ApiResponse<AdminMarriageEventRecord>>(body, { status });
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
        id: marriageEvents.id,
        coverMediaAssetId: marriageEvents.coverMediaAssetId,
        cloudinaryPublicId: mediaAssets.cloudinaryPublicId,
      })
      .from(marriageEvents)
      .leftJoin(mediaAssets, eq(marriageEvents.coverMediaAssetId, mediaAssets.id))
      .where(eq(marriageEvents.id, id))
      .limit(1);

    if (!existing) {
      throw new AppError("Marriage event not found.", 404, "NOT_FOUND");
    }

    if (existing.cloudinaryPublicId) {
      try {
        await deleteCloudinaryAsset(existing.cloudinaryPublicId);
      } catch (cldErr) {
        console.warn("Cloudinary asset deletion warning:", cldErr);
      }
    }

    await db.delete(marriageEvents).where(eq(marriageEvents.id, id));
    if (existing.coverMediaAssetId) {
      await db.delete(mediaAssets).where(eq(mediaAssets.id, existing.coverMediaAssetId));
    }

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "marriage_event",
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
    const { status, body } = toApiErrorResponse(error, "/api/admin/events/[id]");
    const response = NextResponse.json<ApiResponse<{ deleted: boolean }>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
