import { NextResponse } from "next/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, marriageEvents, mediaAssets } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { createMarriageEventSchema } from "@/lib/validations/admin-events-schema";
import type { ApiResponse } from "@/types/api-response";

export interface AdminMarriageEventRecord {
  id: string;
  slug: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  locationEn: string;
  locationTe: string;
  eventDate: string | null;
  coverMediaAssetId: string | null;
  sortOrder: number;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  coverUrl: string | null;
  coverPublicId: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
}

export async function GET(): Promise<NextResponse<ApiResponse<AdminMarriageEventRecord[]>>> {
  try {
    await requireAuthenticatedAdmin();
    const db = await getDatabase();

    const rows = await db
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

    const response = NextResponse.json<ApiResponse<AdminMarriageEventRecord[]>>({
      ok: true,
      data: rows,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/events");
    const response = NextResponse.json<ApiResponse<AdminMarriageEventRecord[]>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<AdminMarriageEventRecord>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const rawBody = await request.json();
    const parsed = createMarriageEventSchema.parse(rawBody);

    const db = await getDatabase();

    const [existing] = await db
      .select({ id: marriageEvents.id })
      .from(marriageEvents)
      .where(eq(marriageEvents.slug, parsed.slug))
      .limit(1);

    if (existing) {
      throw new AppError("An event with this slug already exists.", 409, "CONFLICT");
    }

    const eventId = crypto.randomUUID();
    let coverMediaAssetId: string | null = null;
    const now = new Date().toISOString();

    if (parsed.secureUrl && parsed.cloudinaryPublicId) {
      coverMediaAssetId = crypto.randomUUID();
      await db.insert(mediaAssets).values({
        id: coverMediaAssetId,
        cloudinaryPublicId: parsed.cloudinaryPublicId,
        secureUrl: parsed.secureUrl,
        resourceType: "image",
        format: parsed.format ?? "jpg",
        width: parsed.width ?? 1200,
        height: parsed.height ?? 800,
        bytes: parsed.bytes ?? null,
        altEn: parsed.titleEn,
        altTe: parsed.titleTe,
        uploadedByAdminId: admin.id,
      });
    }

    let sortOrder = parsed.sortOrder;
    if (!sortOrder) {
      const [maxOrder] = await db
        .select({ max: sql<number>`coalesce(max(${marriageEvents.sortOrder}), 0)` })
        .from(marriageEvents);
      sortOrder = (maxOrder?.max ?? 0) + 1;
    }

    const newRecord = {
      id: eventId,
      slug: parsed.slug,
      titleEn: parsed.titleEn,
      titleTe: parsed.titleTe,
      descriptionEn: parsed.descriptionEn,
      descriptionTe: parsed.descriptionTe,
      locationEn: parsed.locationEn,
      locationTe: parsed.locationTe,
      eventDate: parsed.eventDate ?? null,
      coverMediaAssetId,
      sortOrder,
      status: parsed.status,
      publishedAt: parsed.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(marriageEvents).values(newRecord);

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "marriage_event",
      entityId: eventId,
      action: "create",
      snapshotJson: JSON.stringify(newRecord),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const createdRecord: AdminMarriageEventRecord = {
      ...newRecord,
      coverUrl: parsed.secureUrl ?? null,
      coverPublicId: parsed.cloudinaryPublicId ?? null,
      coverWidth: parsed.width ?? null,
      coverHeight: parsed.height ?? null,
    };

    const response = NextResponse.json<ApiResponse<AdminMarriageEventRecord>>(
      { ok: true, data: createdRecord },
      { status: 201 },
    );
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/events");
    const response = NextResponse.json<ApiResponse<AdminMarriageEventRecord>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
