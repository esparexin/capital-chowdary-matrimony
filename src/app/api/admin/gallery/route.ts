import { NextResponse } from "next/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/db";
import { galleryItems, mediaAssets } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { toApiErrorResponse } from "@/lib/utils/error-handler";
import { createGalleryItemSchema } from "@/lib/validations/admin-gallery-schema";
import type { ApiResponse } from "@/types/api-response";

export interface AdminGalleryItemRecord {
  id: string;
  mediaAssetId: string;
  captionEn: string;
  captionTe: string;
  sortOrder: number;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  secureUrl: string;
  cloudinaryPublicId: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  format: string | null;
}

export async function GET(): Promise<NextResponse<ApiResponse<AdminGalleryItemRecord[]>>> {
  try {
    await requireAuthenticatedAdmin();
    const db = await getDatabase();

    const rows = await db
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

    const response = NextResponse.json<ApiResponse<AdminGalleryItemRecord[]>>({
      ok: true,
      data: rows,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/gallery");
    const response = NextResponse.json<ApiResponse<AdminGalleryItemRecord[]>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<AdminGalleryItemRecord>>> {
  try {
    const user = await requireAuthenticatedAdmin();
    const rawBody = await request.json();
    const parsed = createGalleryItemSchema.parse(rawBody);

    const db = await getDatabase();
    const mediaAssetId = crypto.randomUUID();
    const galleryItemId = crypto.randomUUID();

    const [maxOrder] = await db
      .select({ max: sql<number>`coalesce(max(${galleryItems.sortOrder}), 0)` })
      .from(galleryItems);

    const sortOrder = (maxOrder?.max ?? 0) + 1;
    const nowIso = new Date().toISOString();

    await db.insert(mediaAssets).values({
      id: mediaAssetId,
      cloudinaryPublicId: parsed.cloudinaryPublicId,
      secureUrl: parsed.secureUrl,
      resourceType: "image",
      format: parsed.format ?? "jpg",
      width: parsed.width,
      height: parsed.height,
      bytes: parsed.bytes ?? null,
      altEn: parsed.captionEn || "",
      altTe: parsed.captionTe || "",
      uploadedByAdminId: user.id,
    });

    await db.insert(galleryItems).values({
      id: galleryItemId,
      mediaAssetId,
      captionEn: parsed.captionEn,
      captionTe: parsed.captionTe,
      sortOrder,
      status: parsed.status,
      publishedAt: parsed.status === "published" ? nowIso : null,
    });

    const createdRecord: AdminGalleryItemRecord = {
      id: galleryItemId,
      mediaAssetId,
      captionEn: parsed.captionEn,
      captionTe: parsed.captionTe,
      sortOrder,
      status: parsed.status,
      publishedAt: parsed.status === "published" ? nowIso : null,
      createdAt: nowIso,
      secureUrl: parsed.secureUrl,
      cloudinaryPublicId: parsed.cloudinaryPublicId,
      width: parsed.width,
      height: parsed.height,
      bytes: parsed.bytes ?? null,
      format: parsed.format ?? "jpg",
    };

    const response = NextResponse.json<ApiResponse<AdminGalleryItemRecord>>(
      { ok: true, data: createdRecord },
      { status: 201 },
    );
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/gallery");
    const response = NextResponse.json<ApiResponse<AdminGalleryItemRecord>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
