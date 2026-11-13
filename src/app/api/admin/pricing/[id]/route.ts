import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, pricingPlans } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { updatePricingPlanSchema } from "@/lib/validations/admin-pricing-schema";
import type { ApiResponse } from "@/types/api-response";
import type { PricingPlan } from "@/types/database-types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<PricingPlan>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const { id } = await params;
    const rawBody = await request.json();
    const parsed = updatePricingPlanSchema.parse(rawBody);

    const db = await getDatabase();
    const [existing] = await db.select().from(pricingPlans).where(eq(pricingPlans.id, id)).limit(1);

    if (!existing) {
      throw new AppError("Pricing plan not found.", 404, "NOT_FOUND");
    }

    if (parsed.slug && parsed.slug !== existing.slug) {
      const [duplicate] = await db
        .select({ id: pricingPlans.id })
        .from(pricingPlans)
        .where(and(eq(pricingPlans.slug, parsed.slug), ne(pricingPlans.id, id)))
        .limit(1);

      if (duplicate) {
        throw new AppError("A pricing plan with this slug already exists.", 409, "CONFLICT");
      }
    }

    const now = new Date().toISOString();
    const updates: Partial<typeof pricingPlans.$inferInsert> = {
      updatedAt: now,
    };

    if (parsed.slug !== undefined) updates.slug = parsed.slug;
    if (parsed.categoryEn !== undefined) updates.categoryEn = parsed.categoryEn;
    if (parsed.categoryTe !== undefined) updates.categoryTe = parsed.categoryTe;
    if (parsed.registrationFeeInr !== undefined)
      updates.registrationFeeInr = parsed.registrationFeeInr;
    if (parsed.maleCommissionInr !== undefined)
      updates.maleCommissionInr = parsed.maleCommissionInr;
    if (parsed.femaleCommissionInr !== undefined)
      updates.femaleCommissionInr = parsed.femaleCommissionInr;
    if (parsed.validityMonths !== undefined) updates.validityMonths = parsed.validityMonths;
    if (parsed.termsEn !== undefined) updates.termsEn = parsed.termsEn;
    if (parsed.termsTe !== undefined) updates.termsTe = parsed.termsTe;
    if (parsed.verificationStatus !== undefined)
      updates.verificationStatus = parsed.verificationStatus;
    if (parsed.sortOrder !== undefined) updates.sortOrder = parsed.sortOrder;

    if (parsed.status !== undefined) {
      updates.status = parsed.status;
      if (parsed.status === "published" && existing.status !== "published") {
        updates.publishedAt = now;
      } else if (parsed.status === "draft") {
        updates.publishedAt = null;
      }
    }

    await db.update(pricingPlans).set(updates).where(eq(pricingPlans.id, id));

    const action =
      parsed.status && parsed.status !== existing.status
        ? parsed.status === "published"
          ? "publish"
          : "unpublish"
        : "update";

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "pricing_plan",
      entityId: id,
      action,
      snapshotJson: JSON.stringify({ ...existing, ...updates }),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const [updated] = await db.select().from(pricingPlans).where(eq(pricingPlans.id, id)).limit(1);

    const response = NextResponse.json<ApiResponse<PricingPlan>>({
      ok: true,
      data: updated ?? { ...existing, ...updates },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/pricing/[id]");
    const response = NextResponse.json<ApiResponse<PricingPlan>>(body, { status });
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
    const [existing] = await db.select().from(pricingPlans).where(eq(pricingPlans.id, id)).limit(1);

    if (!existing) {
      throw new AppError("Pricing plan not found.", 404, "NOT_FOUND");
    }

    await db.delete(pricingPlans).where(eq(pricingPlans.id, id));

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "pricing_plan",
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
    const { status, body } = toApiErrorResponse(error, "/api/admin/pricing/[id]");
    const response = NextResponse.json<ApiResponse<{ deleted: boolean }>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
