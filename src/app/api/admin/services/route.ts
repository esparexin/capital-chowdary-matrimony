import { NextResponse } from "next/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, services } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { createServiceSchema } from "@/lib/validations/admin-services-schema";
import type { ApiResponse } from "@/types/api-response";
import type { Service } from "@/types/database-types";

export async function GET(): Promise<NextResponse<ApiResponse<Service[]>>> {
  try {
    await requireAuthenticatedAdmin();
    const db = await getDatabase();

    const rows = await db
      .select()
      .from(services)
      .orderBy(asc(services.sortOrder), desc(services.createdAt));

    const response = NextResponse.json<ApiResponse<Service[]>>({
      ok: true,
      data: rows,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/services");
    const response = NextResponse.json<ApiResponse<Service[]>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<Service>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const rawBody = await request.json();
    const parsed = createServiceSchema.parse(rawBody);

    const db = await getDatabase();

    // Check slug uniqueness
    const [existing] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, parsed.slug))
      .limit(1);

    if (existing) {
      throw new AppError("A service with this slug already exists.", 409, "CONFLICT");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Auto sort order if zero provided
    let sortOrder = parsed.sortOrder;
    if (!sortOrder) {
      const [maxOrder] = await db
        .select({ max: sql<number>`coalesce(max(${services.sortOrder}), 0)` })
        .from(services);
      sortOrder = (maxOrder?.max ?? 0) + 1;
    }

    const newRecord = {
      id,
      slug: parsed.slug,
      titleEn: parsed.titleEn,
      titleTe: parsed.titleTe,
      descriptionEn: parsed.descriptionEn,
      descriptionTe: parsed.descriptionTe,
      iconName: parsed.iconName,
      sortOrder,
      status: parsed.status,
      publishedAt: parsed.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(services).values(newRecord);

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "service",
      entityId: id,
      action: "create",
      snapshotJson: JSON.stringify(newRecord),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const response = NextResponse.json<ApiResponse<Service>>(
      { ok: true, data: newRecord },
      { status: 201 },
    );
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/services");
    const response = NextResponse.json<ApiResponse<Service>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
