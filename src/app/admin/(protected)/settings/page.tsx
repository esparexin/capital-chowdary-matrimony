import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { siteSettings } from "@/db/schema";
import { DEFAULT_SITE_SETTINGS } from "@/db/seed/default-content";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";
import type { SiteSettings } from "@/types/database-types";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings: SiteSettings = DEFAULT_SITE_SETTINGS as unknown as SiteSettings;

  try {
    const db = await getDatabase();
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    if (row) {
      settings = row;
    }
  } catch (err) {
    console.error("Failed to fetch site settings in admin:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          Configuration &amp; Operations
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight text-foreground">
          Site Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage business identity, office address, WhatsApp contact channels, and default SEO configuration.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  );
}
