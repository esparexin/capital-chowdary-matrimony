import type { AppDatabase } from "@/db";
import {
  adminUsers,
  contentSections,
  pages,
  pricingPlans,
  services,
  siteSettings,
} from "@/db/schema";
import {
  DEFAULT_CONTENT_SECTIONS,
  DEFAULT_PAGES,
  DEFAULT_PRICING_PLANS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
} from "@/db/seed/default-content";

export interface InitialAdminSeedInput {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

/**
 * Inserts the single private administrator record non-destructively (no-op if email exists).
 */
export async function seedInitialAdmin(
  db: AppDatabase,
  admin: InitialAdminSeedInput,
): Promise<void> {
  await db
    .insert(adminUsers)
    .values({
      id: admin.id,
      email: admin.email.toLowerCase(),
      name: admin.name,
      passwordHash: admin.passwordHash,
      role: "admin",
      isActive: true,
    })
    .onConflictDoNothing();
}

/**
 * Inserts approved default business content and pending-review pricing/legal records
 * without overwriting any existing rows in D1.
 */
export async function seedDefaultContent(db: AppDatabase): Promise<void> {
  await db.insert(siteSettings).values(DEFAULT_SITE_SETTINGS).onConflictDoNothing();

  for (const page of DEFAULT_PAGES) {
    await db.insert(pages).values(page).onConflictDoNothing();
  }

  for (const section of DEFAULT_CONTENT_SECTIONS) {
    await db.insert(contentSections).values(section).onConflictDoNothing();
  }

  for (const service of DEFAULT_SERVICES) {
    await db.insert(services).values(service).onConflictDoNothing();
  }

  for (const plan of DEFAULT_PRICING_PLANS) {
    await db.insert(pricingPlans).values(plan).onConflictDoNothing();
  }
}
