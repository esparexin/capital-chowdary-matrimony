#!/usr/bin/env node

/**
 * Capital Chowdary Matrimony - Cloudflare D1 Database Seeder
 *
 * Seeds baseline site settings, informational pages, homepage content sections,
 * matrimonial services, and approved pricing plans non-destructively.
 *
 * Usage:
 *   npx tsx scripts/seed-d1.ts [--local | --remote]
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  DEFAULT_CONTENT_SECTIONS,
  DEFAULT_PAGES,
  DEFAULT_PRICING_PLANS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
} from "../src/db/seed/default-content";

function sqlVal(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "1" : "0";
  if (typeof val === "number") return Number.isFinite(val) ? String(val) : "0";
  return `'${String(val).replace(/'/g, "''")}'`;
}

function buildSeedSql(): string {
  const statements: string[] = [];
  const now = new Date().toISOString();

  // 1. Site Settings
  const st = DEFAULT_SITE_SETTINGS;
  statements.push(
    `
INSERT INTO site_settings (
  id, business_name_en, business_name_te, tagline_en, tagline_te,
  location_en, location_te, address_en, address_te,
  phone_number, whatsapp_number, contact_email, map_url,
  default_seo_title_en, default_seo_title_te,
  default_seo_description_en, default_seo_description_te,
  is_contact_verified, created_at, updated_at
) VALUES (
  ${sqlVal(st.id ?? "default")}, ${sqlVal(st.businessNameEn)}, ${sqlVal(st.businessNameTe)},
  ${sqlVal(st.taglineEn)}, ${sqlVal(st.taglineTe)}, ${sqlVal(st.locationEn)}, ${sqlVal(st.locationTe)},
  ${sqlVal(st.addressEn)}, ${sqlVal(st.addressTe)}, ${sqlVal(st.phoneNumber)},
  ${sqlVal(st.whatsappNumber)}, ${sqlVal(st.contactEmail)}, ${sqlVal(st.mapUrl)},
  ${sqlVal(st.defaultSeoTitleEn)}, ${sqlVal(st.defaultSeoTitleTe)},
  ${sqlVal(st.defaultSeoDescriptionEn)}, ${sqlVal(st.defaultSeoDescriptionTe)},
  ${sqlVal(st.isContactVerified ?? false)}, ${sqlVal(st.createdAt ?? now)}, ${sqlVal(st.updatedAt ?? now)}
) ON CONFLICT(id) DO NOTHING;
`.trim(),
  );

  // 2. Pages
  for (const page of DEFAULT_PAGES) {
    statements.push(
      `
INSERT INTO pages (
  id, slug, title_en, title_te, summary_en, summary_te,
  body_en, body_te, seo_title_en, seo_title_te,
  seo_description_en, seo_description_te, status,
  verification_status, verification_note_en, verification_note_te,
  published_at, created_at, updated_at
) VALUES (
  ${sqlVal(page.id)}, ${sqlVal(page.slug)}, ${sqlVal(page.titleEn)}, ${sqlVal(page.titleTe)},
  ${sqlVal(page.summaryEn ?? "")}, ${sqlVal(page.summaryTe ?? "")},
  ${sqlVal(page.bodyEn ?? "")}, ${sqlVal(page.bodyTe ?? "")},
  ${sqlVal(page.seoTitleEn ?? "")}, ${sqlVal(page.seoTitleTe ?? "")},
  ${sqlVal(page.seoDescriptionEn ?? "")}, ${sqlVal(page.seoDescriptionTe ?? "")},
  ${sqlVal(page.status ?? "draft")}, ${sqlVal(page.verificationStatus ?? "pending_review")},
  ${sqlVal(page.verificationNoteEn ?? "")}, ${sqlVal(page.verificationNoteTe ?? "")},
  ${sqlVal(page.publishedAt ?? null)}, ${sqlVal(page.createdAt ?? now)}, ${sqlVal(page.updatedAt ?? now)}
) ON CONFLICT(id) DO NOTHING;
`.trim(),
    );
  }

  // 3. Content Sections
  for (const section of DEFAULT_CONTENT_SECTIONS) {
    statements.push(
      `
INSERT INTO content_sections (
  id, page_id, section_key, title_en, title_te,
  subtitle_en, subtitle_te, body_en, body_te,
  metadata_json, media_asset_id, sort_order, status,
  published_at, created_at, updated_at
) VALUES (
  ${sqlVal(section.id)}, ${sqlVal(section.pageId)}, ${sqlVal(section.sectionKey)},
  ${sqlVal(section.titleEn ?? "")}, ${sqlVal(section.titleTe ?? "")},
  ${sqlVal(section.subtitleEn ?? "")}, ${sqlVal(section.subtitleTe ?? "")},
  ${sqlVal(section.bodyEn ?? "")}, ${sqlVal(section.bodyTe ?? "")},
  ${sqlVal(section.metadataJson ?? "{}")}, ${sqlVal(section.mediaAssetId ?? null)},
  ${sqlVal(section.sortOrder ?? 0)}, ${sqlVal(section.status ?? "draft")},
  ${sqlVal(section.publishedAt ?? null)}, ${sqlVal(section.createdAt ?? now)}, ${sqlVal(section.updatedAt ?? now)}
) ON CONFLICT(id) DO NOTHING;
`.trim(),
    );
  }

  // 4. Services
  for (const service of DEFAULT_SERVICES) {
    statements.push(
      `
INSERT INTO services (
  id, slug, title_en, title_te, description_en, description_te,
  icon_name, sort_order, status, published_at, created_at, updated_at
) VALUES (
  ${sqlVal(service.id)}, ${sqlVal(service.slug)}, ${sqlVal(service.titleEn)}, ${sqlVal(service.titleTe)},
  ${sqlVal(service.descriptionEn)}, ${sqlVal(service.descriptionTe)},
  ${sqlVal(service.iconName ?? "HeartHandshake")}, ${sqlVal(service.sortOrder ?? 0)},
  ${sqlVal(service.status ?? "draft")}, ${sqlVal(service.publishedAt ?? null)},
  ${sqlVal(service.createdAt ?? now)}, ${sqlVal(service.updatedAt ?? now)}
) ON CONFLICT(id) DO NOTHING;
`.trim(),
    );
  }

  // 5. Pricing Plans
  for (const plan of DEFAULT_PRICING_PLANS) {
    statements.push(
      `
INSERT INTO pricing_plans (
  id, slug, category_en, category_te, registration_fee_inr,
  male_commission_inr, female_commission_inr, validity_months,
  terms_en, terms_te, verification_status, sort_order, status,
  published_at, created_at, updated_at
) VALUES (
  ${sqlVal(plan.id)}, ${sqlVal(plan.slug)}, ${sqlVal(plan.categoryEn)}, ${sqlVal(plan.categoryTe)},
  ${sqlVal(plan.registrationFeeInr)}, ${sqlVal(plan.maleCommissionInr)}, ${sqlVal(plan.femaleCommissionInr)},
  ${sqlVal(plan.validityMonths ?? 11)}, ${sqlVal(plan.termsEn)}, ${sqlVal(plan.termsTe)},
  ${sqlVal(plan.verificationStatus ?? "pending_review")}, ${sqlVal(plan.sortOrder ?? 0)},
  ${sqlVal(plan.status ?? "draft")}, ${sqlVal(plan.publishedAt ?? null)},
  ${sqlVal(plan.createdAt ?? now)}, ${sqlVal(plan.updatedAt ?? now)}
) ON CONFLICT(id) DO NOTHING;
`.trim(),
    );
  }

  return statements.join("\n\n");
}

async function main() {
  const isRemote = process.argv.includes("--remote");
  const isLocal = process.argv.includes("--local");

  if (!isRemote && !isLocal) {
    console.error("Error: Please specify either --local or --remote flag.");
    console.error("\nExample usage:");
    console.error("  npx tsx scripts/seed-d1.ts --local");
    console.error("  npx tsx scripts/seed-d1.ts --remote\n");
    process.exit(1);
  }

  const targetFlag = isRemote ? "--remote" : "--local";
  console.log(`Generating non-destructive seed statements for Cloudflare D1 (${targetFlag})...`);

  const sql = buildSeedSql();
  const tmpFile = path.join(os.tmpdir(), `seed-d1-${Date.now()}.sql`);

  try {
    fs.writeFileSync(tmpFile, sql, "utf-8");
    console.log(`Executing seed batch on Cloudflare D1 (${targetFlag})...`);
    execFileSync(
      "npx",
      ["wrangler", "d1", "execute", "capital-chowdary-matrimony", targetFlag, `--file=${tmpFile}`],
      { stdio: "inherit" },
    );
    console.log("\nDefault content seeded successfully into Cloudflare D1!");
  } finally {
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }
  }
}

main().catch((err) => {
  console.error("Fatal seeding error:", err);
  process.exit(1);
});
