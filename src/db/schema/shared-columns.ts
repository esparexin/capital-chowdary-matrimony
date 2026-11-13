import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/sqlite-core";

export const PUBLICATION_STATUSES = ["draft", "published"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const VERIFICATION_STATUSES = ["pending_review", "verified"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const REVISION_ENTITY_TYPES = [
  "page",
  "content_section",
  "service",
  "pricing_plan",
  "marriage_event",
  "gallery_item",
  "site_settings",
] as const;
export type RevisionEntityType = (typeof REVISION_ENTITY_TYPES)[number];

export const REVISION_ACTIONS = ["create", "update", "publish", "unpublish", "delete"] as const;
export type RevisionAction = (typeof REVISION_ACTIONS)[number];

/**
 * Standard ISO-8601 UTC timestamp columns for all Cloudflare D1 (SQLite) tables.
 */
export const timestampColumns = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
};
