import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
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
    const updates: Partial<typeof marriageEvents.$inferInsert> = {
      updatedAt: now,
    };

    if (parsed.slug !== undefined) updates.slug = parsed.slug;
    if (parsed.titleEn !== undefined) updates.titleEn = parsed.titleEn;
    if (parsed.titleTe !== undefined) updates.titleTe = parsed.titleTe;
    if (parsed.descriptionEn !== undefined) updates.descriptionEn = parsed.descriptionEn;
    if (parsed.descriptionTe !== undefined) updates.descriptionTe = parsed.descriptionTe;
    if (parsed.locationEn !== undefined) updates.locationEn = parsed.locationEn;
    if (parsed.locationTe !== undefined) updates.locationTe = parsed.locationTe;
    if (parsed.eventDate !== undefined) updates.eventDate = parsed.eventDate;
    if (parsed.sortOrder !== undefined) updates.sortOrder = parsed.sortOrder;

    if (parsed.status !== undefined) {
      updates.status = parsed.status;
      if (parsed.status === "published" && existing.status !== "published") {
        updates.publishedAt = now;
      } else if (parsed.status === "draft") {
        updates.publishedAt = null;
      }
    }

    // Handle cover replacement or removal
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

      if (existing.oldPublicId) {
        try {
          await deleteCloudinaryAsset(existing.oldPublicId);
        } catch (cldErr) {
          console.warn("Cloudinary asset deletion warning:", cldErr);
        }
      }
      if (existing.oldMediaId) {
        await db.delete(mediaAssets).where(eq(mediaAssets.id, existing.oldMediaId));
      }
    } else if (parsed.removeCover && existing.coverMediaAssetId) {
      updates.coverMediaAssetId = null;
      if (existing.oldPublicId) {
        try {
          await deleteCloudinaryAsset(existing.oldPublicId);
        } catch (cldErr) {
          console.warn("Cloudinary asset deletion warning:", cldErr);
        }
      }
      if (existing.oldMediaId) {
        await db.delete(mediaAssets).where(eq(mediaAssets.id, existing.oldMediaId));
      }
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
