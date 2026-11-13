import { asc, desc } from "drizzle-orm";
import { getDatabase } from "@/db";
import { services } from "@/db/schema";
import { AdminServicesManager } from "@/components/admin/AdminServicesManager";
import type { Service } from "@/types/database-types";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  let initialServices: Service[] = [];

  try {
    const db = await getDatabase();
    initialServices = await db
      .select()
      .from(services)
      .orderBy(asc(services.sortOrder), desc(services.createdAt));
  } catch (err) {
    console.error("Failed to fetch initial services in admin:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Offerings Management
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Matrimonial Services
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage matrimonial service offerings, bilingual copy, Lucide icons, and public visibility.
        </p>
      </div>

      <AdminServicesManager initialServices={initialServices} />
    </div>
  );
}
