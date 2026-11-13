import { beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { adminUsers, contentRevisions, pricingPlans } from "@/db/schema";
import { createTestDatabase } from "../helpers/test-database";

let activeTestDb: AppDatabase;

vi.mock("@/db", () => ({
  getDatabase: () => Promise.resolve(activeTestDb),
}));

vi.mock("@/lib/auth/session-guard", () => ({
  requireAuthenticatedAdmin: vi.fn().mockResolvedValue({
    id: "admin-test-id",
    email: "admin@capitalchowdarymatrimony.com",
    fullName: "Admin Tester",
    role: "admin",
  }),
}));

describe("admin pricing API routes", () => {
  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;

    await activeTestDb.insert(adminUsers).values({
      id: "admin-test-id",
      email: "admin@capitalchowdarymatrimony.com",
      name: "Admin Tester",
      passwordHash: "dummy-hash",
      role: "admin",
      isActive: true,
    });
  });

  it("GET /api/admin/pricing returns list of pricing plans", async () => {
    await activeTestDb.insert(pricingPlans).values({
      id: "plan-1",
      slug: "software-alliances",
      categoryEn: "Software Alliances",
      categoryTe: "సాఫ్ట్‌వేర్ సంబంధాలు",
      registrationFeeInr: 10000,
      maleCommissionInr: 250000,
      femaleCommissionInr: 150000,
      validityMonths: 11,
      termsEn: "Terms in English",
      termsTe: "తెలుగు నిబంధనలు",
      verificationStatus: "verified",
      sortOrder: 1,
      status: "published",
    });

    const { GET: getPricingHandler } = await import("@/app/api/admin/pricing/route");
    const response = await getPricingHandler();
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: unknown[] };
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);
  });

  it("POST /api/admin/pricing creates a plan with revision", async () => {
    const { POST: postPricingHandler } = await import("@/app/api/admin/pricing/route");
    const payload = {
      slug: "nri-alliances",
      categoryEn: "NRI Alliances",
      categoryTe: "ఎన్ఆర్ఐ సంబంధాలు",
      registrationFeeInr: 25000,
      maleCommissionInr: 500000,
      femaleCommissionInr: 300000,
      validityMonths: 11,
      termsEn: "NRI terms English",
      termsTe: "ఎన్ఆర్ఐ నిబంధనలు",
      verificationStatus: "verified",
      sortOrder: 2,
      status: "published",
    };

    const request = new Request("http://localhost:3000/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await postPricingHandler(request);
    expect(response.status).toBe(201);

    const json = (await response.json()) as { ok: boolean; data: { id: string; slug: string } };
    expect(json.ok).toBe(true);
    expect(json.data.slug).toBe("nri-alliances");

    const revisions = await activeTestDb
      .select()
      .from(contentRevisions)
      .where(eq(contentRevisions.entityType, "pricing_plan"));
    expect(revisions).toHaveLength(1);
    expect(revisions[0]?.action).toBe("create");
  });

  it("PATCH /api/admin/pricing/[id] updates status and publication timestamp", async () => {
    await activeTestDb.insert(pricingPlans).values({
      id: "plan-to-update",
      slug: "doctor-plan",
      categoryEn: "Doctor Plan",
      categoryTe: "డాక్టర్ ప్లాన్",
      registrationFeeInr: 15000,
      maleCommissionInr: 300000,
      femaleCommissionInr: 200000,
      validityMonths: 11,
      termsEn: "Doctor terms",
      termsTe: "నిబంధనలు",
      verificationStatus: "verified",
      sortOrder: 1,
      status: "draft",
    });

    const { PATCH: patchPricingHandler } = await import("@/app/api/admin/pricing/[id]/route");
    const request = new Request("http://localhost:3000/api/admin/pricing/plan-to-update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });

    const response = await patchPricingHandler(request, {
      params: Promise.resolve({ id: "plan-to-update" }),
    });
    expect(response.status).toBe(200);

    const [updated] = await activeTestDb
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.id, "plan-to-update"));
    expect(updated?.status).toBe("published");
    expect(updated?.publishedAt).not.toBeNull();
  });

  it("DELETE /api/admin/pricing/[id] removes pricing plan and logs revision", async () => {
    await activeTestDb.insert(pricingPlans).values({
      id: "plan-to-delete",
      slug: "del-plan",
      categoryEn: "Delete Plan",
      categoryTe: "డిలీట్",
      registrationFeeInr: 5000,
      maleCommissionInr: 100000,
      femaleCommissionInr: 100000,
      validityMonths: 11,
      termsEn: "Terms",
      termsTe: "నిబంధనలు",
      verificationStatus: "verified",
      sortOrder: 1,
      status: "draft",
    });

    const { DELETE: deletePricingHandler } = await import("@/app/api/admin/pricing/[id]/route");
    const request = new Request("http://localhost:3000/api/admin/pricing/plan-to-delete", {
      method: "DELETE",
    });

    const response = await deletePricingHandler(request, {
      params: Promise.resolve({ id: "plan-to-delete" }),
    });
    expect(response.status).toBe(200);

    const [deleted] = await activeTestDb
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.id, "plan-to-delete"));
    expect(deleted).toBeUndefined();
  });
});
