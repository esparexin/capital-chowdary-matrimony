import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { adminUsers } from "./admin-schema";
import { mediaAssets } from "./media-schema";
import {
  type PublicationStatus,
  type RevisionAction,
  type RevisionEntityType,
  type VerificationStatus,
  timestampColumns,
} from "./shared-columns";

export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey().default("default"),
  businessNameEn: text("business_name_en").notNull(),
  businessNameTe: text("business_name_te").notNull(),
  taglineEn: text("tagline_en").notNull(),
  taglineTe: text("tagline_te").notNull(),
  locationEn: text("location_en").notNull(),
  locationTe: text("location_te").notNull(),
  addressEn: text("address_en").notNull().default(""),
  addressTe: text("address_te").notNull().default(""),
  phoneNumber: text("phone_number").notNull().default(""),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  contactEmail: text("contact_email").notNull().default(""),
  mapUrl: text("map_url").notNull().default(""),
  defaultSeoTitleEn: text("default_seo_title_en").notNull(),
  defaultSeoTitleTe: text("default_seo_title_te").notNull(),
  defaultSeoDescriptionEn: text("default_seo_description_en").notNull(),
  defaultSeoDescriptionTe: text("default_seo_description_te").notNull(),
  isContactVerified: integer("is_contact_verified", { mode: "boolean" }).notNull().default(false),
  ...timestampColumns,
});

export const pages = sqliteTable(
  "pages",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    titleEn: text("title_en").notNull(),
    titleTe: text("title_te").notNull(),
    summaryEn: text("summary_en").notNull().default(""),
    summaryTe: text("summary_te").notNull().default(""),
    bodyEn: text("body_en").notNull().default(""),
    bodyTe: text("body_te").notNull().default(""),
    seoTitleEn: text("seo_title_en").notNull().default(""),
    seoTitleTe: text("seo_title_te").notNull().default(""),
    seoDescriptionEn: text("seo_description_en").notNull().default(""),
    seoDescriptionTe: text("seo_description_te").notNull().default(""),
    status: text("status").$type<PublicationStatus>().notNull().default("draft"),
    verificationStatus: text("verification_status")
      .$type<VerificationStatus>()
      .notNull()
      .default("pending_review"),
    verificationNoteEn: text("verification_note_en").notNull().default(""),
    verificationNoteTe: text("verification_note_te").notNull().default(""),
    publishedAt: text("published_at"),
    updatedByAdminId: text("updated_by_admin_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    ...timestampColumns,
  },
  (table) => [index("idx_pages_status").on(table.status)],
);

export const contentSections = sqliteTable(
  "content_sections",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    sectionKey: text("section_key").notNull(),
    titleEn: text("title_en").notNull().default(""),
    titleTe: text("title_te").notNull().default(""),
    subtitleEn: text("subtitle_en").notNull().default(""),
    subtitleTe: text("subtitle_te").notNull().default(""),
    bodyEn: text("body_en").notNull().default(""),
    bodyTe: text("body_te").notNull().default(""),
    metadataJson: text("metadata_json").notNull().default("{}"),
    mediaAssetId: text("media_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<PublicationStatus>().notNull().default("draft"),
    publishedAt: text("published_at"),
    ...timestampColumns,
  },
  (table) => [
    uniqueIndex("uq_content_sections_page_key").on(table.pageId, table.sectionKey),
    index("idx_content_sections_page_order").on(table.pageId, table.sortOrder),
  ],
);

export const services = sqliteTable(
  "services",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    titleEn: text("title_en").notNull(),
    titleTe: text("title_te").notNull(),
    descriptionEn: text("description_en").notNull(),
    descriptionTe: text("description_te").notNull(),
    iconName: text("icon_name").notNull().default("HeartHandshake"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<PublicationStatus>().notNull().default("draft"),
    publishedAt: text("published_at"),
    ...timestampColumns,
  },
  (table) => [index("idx_services_status_order").on(table.status, table.sortOrder)],
);

export const pricingPlans = sqliteTable(
  "pricing_plans",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    categoryEn: text("category_en").notNull(),
    categoryTe: text("category_te").notNull(),
    registrationFeeInr: integer("registration_fee_inr").notNull(),
    maleCommissionInr: integer("male_commission_inr").notNull(),
    femaleCommissionInr: integer("female_commission_inr").notNull(),
    validityMonths: integer("validity_months").notNull().default(11),
    termsEn: text("terms_en").notNull(),
    termsTe: text("terms_te").notNull(),
    verificationStatus: text("verification_status")
      .$type<VerificationStatus>()
      .notNull()
      .default("pending_review"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<PublicationStatus>().notNull().default("draft"),
    publishedAt: text("published_at"),
    ...timestampColumns,
  },
  (table) => [index("idx_pricing_plans_status_order").on(table.status, table.sortOrder)],
);

export const marriageEvents = sqliteTable(
  "marriage_events",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    titleEn: text("title_en").notNull(),
    titleTe: text("title_te").notNull(),
    descriptionEn: text("description_en").notNull().default(""),
    descriptionTe: text("description_te").notNull().default(""),
    locationEn: text("location_en").notNull().default(""),
    locationTe: text("location_te").notNull().default(""),
    eventDate: text("event_date"),
    coverMediaAssetId: text("cover_media_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<PublicationStatus>().notNull().default("draft"),
    publishedAt: text("published_at"),
    ...timestampColumns,
  },
  (table) => [index("idx_marriage_events_status_order").on(table.status, table.sortOrder)],
);

export const galleryItems = sqliteTable(
  "gallery_items",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id").references(() => marriageEvents.id, { onDelete: "set null" }),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    captionEn: text("caption_en").notNull().default(""),
    captionTe: text("caption_te").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    status: text("status").$type<PublicationStatus>().notNull().default("draft"),
    publishedAt: text("published_at"),
    ...timestampColumns,
  },
  (table) => [
    index("idx_gallery_items_status_order").on(table.status, table.sortOrder),
    index("idx_gallery_items_event_id").on(table.eventId),
  ],
);

export const contentRevisions = sqliteTable(
  "content_revisions",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").$type<RevisionEntityType>().notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").$type<RevisionAction>().notNull(),
    snapshotJson: text("snapshot_json").notNull(),
    changedByAdminId: text("changed_by_admin_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  },
  (table) => [
    index("idx_content_revisions_entity").on(table.entityType, table.entityId, table.createdAt),
  ],
);
