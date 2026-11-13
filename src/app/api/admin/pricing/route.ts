import { NextResponse } from "next/server";
import { asc, desc, eq, sql } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, pricingPlans } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { createPricingPlanSchema } from "@/lib/validations/admin-pricing-schema";
import type { ApiResponse } from "@/types/api-response";
import type { PricingPlan } from "@/types/database-types";

export async function GET(): Promise<NextResponse<ApiResponse<PricingPlan[]>>> {
  try {
    await requireAuthenticatedAdmin();
    const db = await getDatabase();

    const rows = await db
      .select()
      .from(pricingPlans)
      .orderBy(asc(pricingPlans.sortOrder), desc(pricingPlans.createdAt));

    const response = NextResponse.json<ApiResponse<PricingPlan[]>>({
      ok: true,
      data: rows,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/pricing");
    const response = NextResponse.json<ApiResponse<PricingPlan[]>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<PricingPlan>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const rawBody = await request.json();
    const parsed = createPricingPlanSchema.parse(rawBody);

    const db = await getDatabase();

    const [existing] = await db
      .select({ id: pricingPlans.id })
      .from(pricingPlans)
      .where(eq(pricingPlans.slug, parsed.slug))
      .limit(1);

    if (existing) {
      throw new AppError("A pricing plan with this slug already exists.", 409, "CONFLICT");
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    let sortOrder = parsed.sortOrder;
    if (!sortOrder) {
      const [maxOrder] = await db
        .select({ max: sql<number>`coalesce(max(${pricingPlans.sortOrder}), 0)` })
        .from(pricingPlans);
      sortOrder = (maxOrder?.max ?? 0) + 1;
    }

    const newRecord = {
      id,
      slug: parsed.slug,
      categoryEn: parsed.categoryEn,
      categoryTe: parsed.categoryTe,
      registrationFeeInr: parsed.registrationFeeInr,
      maleCommissionInr: parsed.maleCommissionInr,
      femaleCommissionInr: parsed.femaleCommissionInr,
      validityMonths: parsed.validityMonths,
      termsEn: parsed.termsEn,
      termsTe: parsed.termsTe,
      verificationStatus: parsed.verificationStatus,
      sortOrder,
      status: parsed.status,
      publishedAt: parsed.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(pricingPlans).values(newRecord);

    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "pricing_plan",
      entityId: id,
      action: "create",
      snapshotJson: JSON.stringify(newRecord),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const response = NextResponse.json<ApiResponse<PricingPlan>>(
      { ok: true, data: newRecord },
      { status: 201 },
    );
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/pricing");
    const response = NextResponse.json<ApiResponse<PricingPlan>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
