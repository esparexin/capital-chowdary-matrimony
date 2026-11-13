import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, contentSections, mediaAssets } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/cloudinary-destroy";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { updateHomepageHeroSchema } from "@/lib/validations/admin-homepage-schema";
import type { ApiResponse } from "@/types/api-response";

export interface AdminHomepageHeroData {
  id: string;
  titleEn: string;
  titleTe: string;
  bodyEn: string;
  primaryCtaHref: string;
  primaryCtaLabelEn: string;
  secondaryCtaHref: string;
  secondaryCtaLabelEn: string;
  associationName: string;
  associationDetail: string;
  highlights: Array<{ title: string; description: string }>;
  status: "draft" | "published";
  mediaAssetId: string | null;
  bannerUrl: string | null;
  bannerPublicId: string | null;
  bannerWidth: number | null;
  bannerHeight: number | null;
  bannerAltEn: string | null;
}

export async function GET(): Promise<NextResponse<ApiResponse<AdminHomepageHeroData>>> {
  try {
    await requireAuthenticatedAdmin();
    const db = await getDatabase();

    const [row] = await db
      .select({
        id: contentSections.id,
        titleEn: contentSections.titleEn,
        titleTe: contentSections.titleTe,
        bodyEn: contentSections.bodyEn,
        metadataJson: contentSections.metadataJson,
        status: contentSections.status,
        mediaAssetId: contentSections.mediaAssetId,
        bannerUrl: mediaAssets.secureUrl,
        bannerPublicId: mediaAssets.cloudinaryPublicId,
        bannerWidth: mediaAssets.width,
        bannerHeight: mediaAssets.height,
        bannerAltEn: mediaAssets.altEn,
      })
      .from(contentSections)
      .leftJoin(mediaAssets, eq(contentSections.mediaAssetId, mediaAssets.id))
      .where(
        and(
          eq(contentSections.pageId, "page-home"),
          eq(contentSections.sectionKey, "hero"),
        ),
      )
      .limit(1);

    if (!row) {
      throw new AppError("Homepage hero section not found.", 404, "NOT_FOUND");
    }

    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(row.metadataJson || "{}");
    } catch {
      meta = {};
    }

    const data: AdminHomepageHeroData = {
      id: row.id,
      titleEn: row.titleEn,
      titleTe: row.titleTe,
      bodyEn: row.bodyEn,
      primaryCtaHref: typeof meta.primaryCtaHref === "string" ? meta.primaryCtaHref : "/register",
      primaryCtaLabelEn:
        typeof meta.primaryCtaLabelEn === "string" ? meta.primaryCtaLabelEn : "Register",
      secondaryCtaHref:
        typeof meta.secondaryCtaHref === "string" ? meta.secondaryCtaHref : "/contact",
      secondaryCtaLabelEn:
        typeof meta.secondaryCtaLabelEn === "string" ? meta.secondaryCtaLabelEn : "Contact Us",
      associationName:
        typeof meta.associationName === "string"
          ? meta.associationName
          : "Kamma Welfare Association",
      associationDetail:
        typeof meta.associationDetail === "string"
          ? meta.associationDetail
          : "Andhra & Telangana · Regd. No: AP-07 91-058-0756579",
      highlights: Array.isArray(meta.highlights)
        ? (meta.highlights as Array<{ title: string; description: string }>)
        : [
            {
              title: "Andhra Pradesh & Telangana",
              description: "Alliances across both Telugu states",
            },
          ],
      status: row.status as "draft" | "published",
      mediaAssetId: row.mediaAssetId,
      bannerUrl: row.bannerUrl,
      bannerPublicId: row.bannerPublicId,
      bannerWidth: row.bannerWidth,
      bannerHeight: row.bannerHeight,
      bannerAltEn: row.bannerAltEn,
    };

    const response = NextResponse.json<ApiResponse<AdminHomepageHeroData>>({
      ok: true,
      data,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/homepage");
    const response = NextResponse.json<ApiResponse<AdminHomepageHeroData>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function PATCH(
  request: Request,
): Promise<NextResponse<ApiResponse<AdminHomepageHeroData>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const rawBody = await request.json();
    const parsed = updateHomepageHeroSchema.parse(rawBody);

    const db = await getDatabase();

    const [existing] = await db
      .select({
        id: contentSections.id,
        mediaAssetId: contentSections.mediaAssetId,
        oldPublicId: mediaAssets.cloudinaryPublicId,
        oldMediaId: mediaAssets.id,
      })
      .from(contentSections)
      .leftJoin(mediaAssets, eq(contentSections.mediaAssetId, mediaAssets.id))
      .where(
        and(
          eq(contentSections.pageId, "page-home"),
          eq(contentSections.sectionKey, "hero"),
        ),
      )
      .limit(1);

    if (!existing) {
      throw new AppError("Homepage hero section not found.", 404, "NOT_FOUND");
    }

    const now = new Date().toISOString();
    let newMediaAssetId = existing.mediaAssetId;

    if (parsed.secureUrl && parsed.cloudinaryPublicId) {
      newMediaAssetId = crypto.randomUUID();
      await db.insert(mediaAssets).values({
        id: newMediaAssetId,
        cloudinaryPublicId: parsed.cloudinaryPublicId,
        secureUrl: parsed.secureUrl,
        resourceType: "image",
        format: parsed.format ?? "jpg",
        width: parsed.width ?? 1200,
        height: parsed.height ?? 896,
        bytes: parsed.bytes ?? null,
        altEn: parsed.altEn ?? parsed.titleEn,
        altTe: parsed.titleTe,
        uploadedByAdminId: admin.id,
      });

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

    const metadataObj = {
      primaryCtaHref: parsed.primaryCtaHref,
      primaryCtaLabelEn: parsed.primaryCtaLabelEn,
      secondaryCtaHref: parsed.secondaryCtaHref,
      secondaryCtaLabelEn: parsed.secondaryCtaLabelEn,
      associationName: parsed.associationName,
      associationDetail: parsed.associationDetail,
      highlights: parsed.highlights,
      fallbackImageAltEn: parsed.altEn ?? parsed.titleEn,
    };

    const updates = {
      titleEn: parsed.titleEn,
      titleTe: parsed.titleTe,
      bodyEn: parsed.bodyEn,
      metadataJson: JSON.stringify(metadataObj),
      mediaAssetId: newMediaAssetId,
      status: parsed.status,
      publishedAt: parsed.status === "published" ? now : null,
      updatedAt: now,
    };

    await db
      .update(contentSections)
      .set(updates)
      .where(eq(contentSections.id, existing.id));

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "content_section",
      entityId: existing.id,
      action: "update",
      snapshotJson: JSON.stringify({ ...updates, metadata: metadataObj }),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const [updatedRow] = await db
      .select({
        id: contentSections.id,
        titleEn: contentSections.titleEn,
        titleTe: contentSections.titleTe,
        bodyEn: contentSections.bodyEn,
        metadataJson: contentSections.metadataJson,
        status: contentSections.status,
        mediaAssetId: contentSections.mediaAssetId,
        bannerUrl: mediaAssets.secureUrl,
        bannerPublicId: mediaAssets.cloudinaryPublicId,
        bannerWidth: mediaAssets.width,
        bannerHeight: mediaAssets.height,
        bannerAltEn: mediaAssets.altEn,
      })
      .from(contentSections)
      .leftJoin(mediaAssets, eq(contentSections.mediaAssetId, mediaAssets.id))
      .where(eq(contentSections.id, existing.id))
      .limit(1);

    const resultData: AdminHomepageHeroData = {
      id: updatedRow!.id,
      titleEn: updatedRow!.titleEn,
      titleTe: updatedRow!.titleTe,
      bodyEn: updatedRow!.bodyEn,
      primaryCtaHref: parsed.primaryCtaHref,
      primaryCtaLabelEn: parsed.primaryCtaLabelEn,
      secondaryCtaHref: parsed.secondaryCtaHref,
      secondaryCtaLabelEn: parsed.secondaryCtaLabelEn,
      associationName: parsed.associationName,
      associationDetail: parsed.associationDetail,
      highlights: parsed.highlights,
      status: updatedRow!.status as "draft" | "published",
      mediaAssetId: updatedRow!.mediaAssetId,
      bannerUrl: updatedRow!.bannerUrl,
      bannerPublicId: updatedRow!.bannerPublicId,
      bannerWidth: updatedRow!.bannerWidth,
      bannerHeight: updatedRow!.bannerHeight,
      bannerAltEn: updatedRow!.bannerAltEn,
    };

    const response = NextResponse.json<ApiResponse<AdminHomepageHeroData>>({
      ok: true,
      data: resultData,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/homepage");
    const response = NextResponse.json<ApiResponse<AdminHomepageHeroData>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
