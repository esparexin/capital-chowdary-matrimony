import { asc } from "drizzle-orm";
import { getDatabase } from "@/db";
import { pages } from "@/db/schema";
import { AdminPagesManager } from "@/components/admin/AdminPagesManager";
import type { Page } from "@/types/database-types";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  let initialPages: Page[] = [];

  try {
    const db = await getDatabase();
    initialPages = await db.select().from(pages).orderBy(asc(pages.slug));
  } catch (err) {
    console.error("Failed to fetch initial pages in admin:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Site Content &amp; Compliance
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Pages &amp; Legal Content
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage bilingual content for About Us, How It Works, Terms &amp; Conditions, Privacy
          Policy, and SEO metadata.
        </p>
      </div>

      <AdminPagesManager initialPages={initialPages} />
    </div>
  );
}
