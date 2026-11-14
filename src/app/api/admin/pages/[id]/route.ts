import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, contentSections, pages } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { updatePageSchema } from "@/lib/validations/admin-pages-schema";
import type { ApiResponse } from "@/types/api-response";
import type { ContentSection, Page } from "@/types/database-types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export interface AdminPageDetailsResponse {
  page: Page;
  sections: ContentSection[];
}

export async function GET(
  _request: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<AdminPageDetailsResponse>>> {
  try {
    await requireAuthenticatedAdmin();
    const { id } = await params;

    const db = await getDatabase();
    const [pageRow] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

    if (!pageRow) {
      throw new AppError("Page not found.", 404, "NOT_FOUND");
    }

    const sectionRows = await db
      .select()
      .from(contentSections)
      .where(eq(contentSections.pageId, pageRow.id))
      .orderBy(asc(contentSections.sortOrder));

    const response = NextResponse.json<ApiResponse<AdminPageDetailsResponse>>({
      ok: true,
      data: {
        page: pageRow,
        sections: sectionRows,
      },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/pages/[id]");
    const response = NextResponse.json<ApiResponse<AdminPageDetailsResponse>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<Page>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const { id } = await params;
    const rawBody = await request.json();
    const parsed = updatePageSchema.parse(rawBody);

    const db = await getDatabase();
    const [existing] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

    if (!existing) {
      throw new AppError("Page not found.", 404, "NOT_FOUND");
    }

    const now = new Date().toISOString();
    const updates: Partial<typeof pages.$inferInsert> = {
      titleEn: parsed.titleEn,
      titleTe: parsed.titleTe,
      summaryEn: parsed.summaryEn,
      summaryTe: parsed.summaryTe,
      bodyEn: parsed.bodyEn,
      bodyTe: parsed.bodyTe,
      seoTitleEn: parsed.seoTitleEn,
      seoTitleTe: parsed.seoTitleTe,
      seoDescriptionEn: parsed.seoDescriptionEn,
      seoDescriptionTe: parsed.seoDescriptionTe,
      updatedByAdminId: admin.id,
      updatedAt: now,
    };

    if (parsed.status !== undefined) {
      updates.status = parsed.status;
      if (parsed.status === "published" && existing.status !== "published") {
        updates.publishedAt = now;
      } else if (parsed.status === "draft") {
        updates.publishedAt = null;
      }
    }

    if (parsed.verificationStatus !== undefined) {
      updates.verificationStatus = parsed.verificationStatus;
    }
    if (parsed.verificationNoteEn !== undefined) {
      updates.verificationNoteEn = parsed.verificationNoteEn;
    }
    if (parsed.verificationNoteTe !== undefined) {
      updates.verificationNoteTe = parsed.verificationNoteTe;
    }

    await db.update(pages).set(updates).where(eq(pages.id, id));

    const action =
      parsed.status && parsed.status !== existing.status
        ? parsed.status === "published"
          ? "publish"
          : "unpublish"
        : "update";

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "page",
      entityId: id,
      action,
      snapshotJson: JSON.stringify({ ...existing, ...updates }),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const [updated] = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

    const response = NextResponse.json<ApiResponse<Page>>({
      ok: true,
      data: updated ?? { ...existing, ...updates },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/pages/[id]");
    const response = NextResponse.json<ApiResponse<Page>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
