import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, services } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { updateServiceSchema } from "@/lib/validations/admin-services-schema";
import type { ApiResponse } from "@/types/api-response";
import type { Service } from "@/types/database-types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<Service>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const { id } = await params;
    const rawBody = await request.json();
    const parsed = updateServiceSchema.parse(rawBody);

    const db = await getDatabase();
    const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1);

    if (!existing) {
      throw new AppError("Service not found.", 404, "NOT_FOUND");
    }

    if (parsed.slug && parsed.slug !== existing.slug) {
      const [duplicate] = await db
        .select({ id: services.id })
        .from(services)
        .where(and(eq(services.slug, parsed.slug), ne(services.id, id)))
        .limit(1);

      if (duplicate) {
        throw new AppError("A service with this slug already exists.", 409, "CONFLICT");
      }
    }

    const now = new Date().toISOString();
    const updates: Partial<typeof services.$inferInsert> = {
      updatedAt: now,
    };

    if (parsed.slug !== undefined) updates.slug = parsed.slug;
    if (parsed.titleEn !== undefined) updates.titleEn = parsed.titleEn;
    if (parsed.titleTe !== undefined) updates.titleTe = parsed.titleTe;
    if (parsed.descriptionEn !== undefined) updates.descriptionEn = parsed.descriptionEn;
    if (parsed.descriptionTe !== undefined) updates.descriptionTe = parsed.descriptionTe;
    if (parsed.iconName !== undefined) updates.iconName = parsed.iconName;
    if (parsed.sortOrder !== undefined) updates.sortOrder = parsed.sortOrder;

    if (parsed.status !== undefined) {
      updates.status = parsed.status;
      if (parsed.status === "published" && existing.status !== "published") {
        updates.publishedAt = now;
      } else if (parsed.status === "draft") {
        updates.publishedAt = null;
      }
    }

    await db.update(services).set(updates).where(eq(services.id, id));

    const action =
      parsed.status && parsed.status !== existing.status
        ? parsed.status === "published"
          ? "publish"
          : "unpublish"
        : "update";

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "service",
      entityId: id,
      action,
      snapshotJson: JSON.stringify({ ...existing, ...updates }),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const [updated] = await db.select().from(services).where(eq(services.id, id)).limit(1);

    const response = NextResponse.json<ApiResponse<Service>>({
      ok: true,
      data: updated ?? { ...existing, ...updates },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/services/[id]");
    const response = NextResponse.json<ApiResponse<Service>>(body, { status });
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
    const [existing] = await db.select().from(services).where(eq(services.id, id)).limit(1);

    if (!existing) {
      throw new AppError("Service not found.", 404, "NOT_FOUND");
    }

    await db.delete(services).where(eq(services.id, id));

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "service",
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
    const { status, body } = toApiErrorResponse(error, "/api/admin/services/[id]");
    const response = NextResponse.json<ApiResponse<{ deleted: boolean }>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
