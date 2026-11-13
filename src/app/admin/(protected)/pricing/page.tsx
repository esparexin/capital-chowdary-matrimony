import { asc, desc } from "drizzle-orm";
import { getDatabase } from "@/db";
import { pricingPlans } from "@/db/schema";
import { AdminPricingManager } from "@/components/admin/AdminPricingManager";
import type { PricingPlan } from "@/types/database-types";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  let initialPlans: PricingPlan[] = [];

  try {
    const db = await getDatabase();
    initialPlans = await db
      .select()
      .from(pricingPlans)
      .orderBy(asc(pricingPlans.sortOrder), desc(pricingPlans.createdAt));
  } catch (err) {
    console.error("Failed to fetch initial pricing plans in admin:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Membership Management
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Pricing Plans &amp; Fee Tiers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure matrimonial category registration fees, commissions, 11-month validity rules, and public visibility.
        </p>
      </div>

      <AdminPricingManager initialPlans={initialPlans} />
    </div>
  );
}
