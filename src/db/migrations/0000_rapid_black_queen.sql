CREATE TABLE IF NOT EXISTS `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`revoked_at` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `admin_sessions_token_hash_unique` ON `admin_sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_admin_sessions_user_id` ON `admin_sessions` (`admin_user_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_admin_sessions_expires_at` ON `admin_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `content_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`changed_by_admin_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`changed_by_admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_content_revisions_entity` ON `content_revisions` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `content_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`section_key` text NOT NULL,
	`title_en` text DEFAULT '' NOT NULL,
	`title_te` text DEFAULT '' NOT NULL,
	`subtitle_en` text DEFAULT '' NOT NULL,
	`subtitle_te` text DEFAULT '' NOT NULL,
	`body_en` text DEFAULT '' NOT NULL,
	`body_te` text DEFAULT '' NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`media_asset_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `uq_content_sections_page_key` ON `content_sections` (`page_id`,`section_key`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_content_sections_page_order` ON `content_sections` (`page_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `gallery_items` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text,
	`media_asset_id` text NOT NULL,
	`caption_en` text DEFAULT '' NOT NULL,
	`caption_te` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `marriage_events`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_gallery_items_status_order` ON `gallery_items` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_gallery_items_event_id` ON `gallery_items` (`event_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `login_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`window_started_at` text NOT NULL,
	`locked_until` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `marriage_events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_te` text NOT NULL,
	`description_en` text DEFAULT '' NOT NULL,
	`description_te` text DEFAULT '' NOT NULL,
	`location_en` text DEFAULT '' NOT NULL,
	`location_te` text DEFAULT '' NOT NULL,
	`event_date` text,
	`cover_media_asset_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`cover_media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `marriage_events_slug_unique` ON `marriage_events` (`slug`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_marriage_events_status_order` ON `marriage_events` (`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`cloudinary_public_id` text NOT NULL,
	`secure_url` text NOT NULL,
	`resource_type` text DEFAULT 'image' NOT NULL,
	`format` text,
	`width` integer,
	`height` integer,
	`bytes` integer,
	`alt_en` text DEFAULT '' NOT NULL,
	`alt_te` text DEFAULT '' NOT NULL,
	`uploaded_by_admin_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`uploaded_by_admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `media_assets_cloudinary_public_id_unique` ON `media_assets` (`cloudinary_public_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_te` text NOT NULL,
	`summary_en` text DEFAULT '' NOT NULL,
	`summary_te` text DEFAULT '' NOT NULL,
	`body_en` text DEFAULT '' NOT NULL,
	`body_te` text DEFAULT '' NOT NULL,
	`seo_title_en` text DEFAULT '' NOT NULL,
	`seo_title_te` text DEFAULT '' NOT NULL,
	`seo_description_en` text DEFAULT '' NOT NULL,
	`seo_description_te` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`verification_status` text DEFAULT 'pending_review' NOT NULL,
	`verification_note_en` text DEFAULT '' NOT NULL,
	`verification_note_te` text DEFAULT '' NOT NULL,
	`published_at` text,
	`updated_by_admin_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`updated_by_admin_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_pages_status` ON `pages` (`status`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pricing_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`category_en` text NOT NULL,
	`category_te` text NOT NULL,
	`registration_fee_inr` integer NOT NULL,
	`male_commission_inr` integer NOT NULL,
	`female_commission_inr` integer NOT NULL,
	`validity_months` integer DEFAULT 11 NOT NULL,
	`terms_en` text NOT NULL,
	`terms_te` text NOT NULL,
	`verification_status` text DEFAULT 'pending_review' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `pricing_plans_slug_unique` ON `pricing_plans` (`slug`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_pricing_plans_status_order` ON `pricing_plans` (`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_te` text NOT NULL,
	`description_en` text NOT NULL,
	`description_te` text NOT NULL,
	`icon_name` text DEFAULT 'HeartHandshake' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_services_status_order` ON `services` (`status`,`sort_order`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `site_settings` (
	`id` text PRIMARY KEY DEFAULT 'default' NOT NULL,
	`business_name_en` text NOT NULL,
	`business_name_te` text NOT NULL,
	`tagline_en` text NOT NULL,
	`tagline_te` text NOT NULL,
	`location_en` text NOT NULL,
	`location_te` text NOT NULL,
	`address_en` text DEFAULT '' NOT NULL,
	`address_te` text DEFAULT '' NOT NULL,
	`phone_number` text DEFAULT '' NOT NULL,
	`whatsapp_number` text DEFAULT '' NOT NULL,
	`contact_email` text DEFAULT '' NOT NULL,
	`map_url` text DEFAULT '' NOT NULL,
	`default_seo_title_en` text NOT NULL,
	`default_seo_title_te` text NOT NULL,
	`default_seo_description_en` text NOT NULL,
	`default_seo_description_te` text NOT NULL,
	`is_contact_verified` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
