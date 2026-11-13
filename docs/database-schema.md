# Database Architecture — Cloudflare D1 & Drizzle ORM

## 1. Binding & Connectivity

- **Database Name:** `capital-chowdary-matrimony`
- **Database ID:** `a86d49b4-b86a-4caa-889b-643c4072e06e` (declared in `wrangler.jsonc`)
- **Worker Binding:** `DB`
- **Runtime Access:** `src/lib/database/d1-client.ts` resolves `env.DB` using `getCloudflareContext({ async: true })` from `@opennextjs/cloudflare`.
- **Drizzle Client:** `src/db/index.ts` exports `getDatabase()`, returning `drizzle(d1, { schema })`.

## 2. Schema Entities (`src/db/schema/`)

All tables use `snake_case` naming, explicit foreign keys, indexes, and UTC ISO-8601 timestamps (`src/db/schema/shared-columns.ts`):

1. `admin_users` (`src/db/schema/admin-schema.ts`) — single private administrator account and password hash
2. `admin_sessions` (`src/db/schema/admin-schema.ts`) — hashed server-side session tokens, expiry, and revocation
3. `login_rate_limits` (`src/db/schema/admin-schema.ts`) — persistent D1 login rate-limiting state
4. `media_assets` (`src/db/schema/media-schema.ts`) — Cloudinary `cloudinary_public_id`, `secure_url`, dimensions, format, file size, bilingual alt text, and admin uploader reference. Serves as the single SSOT metadata table for all images (Gallery items, Marriage Events cover art, Muhurtham calendar charts, and Homepage banners). Zero image binary blobs are stored in D1.
5. `site_settings` (`src/db/schema/cms-schema.ts`) — business name, Narasaraopet location, verified contact fields, default bilingual SEO settings
6. `pages` (`src/db/schema/cms-schema.ts`) — bilingual pages (`home`, `about`, `services`, `pricing`, `register`, `events`, `how-it-works`, `contact`, `privacy`, `terms-and-conditions`), publication state, verification status, SEO fields
7. `content_sections` (`src/db/schema/cms-schema.ts`) — ordered bilingual page sections and structured JSON metadata
8. `services` (`src/db/schema/cms-schema.ts`) — matrimonial bureau services with Lucide icon identifiers
9. `pricing_plans` (`src/db/schema/cms-schema.ts`) — category registration fees, commission amounts, validity, and owner-verification state
10. `marriage_events` (`src/db/schema/cms-schema.ts`) — administrator-published marriage events
11. `gallery_items` (`src/db/schema/cms-schema.ts`) — gallery photos linked to `media_assets` and optionally `marriage_events`
12. `content_revisions` (`src/db/schema/cms-schema.ts`) — audit trail snapshots of content edits and publication actions

No customer accounts, bride/groom profile tables, inquiry submission tables, or payment/receipt tables exist.

## 3. Non-Destructive Migration & Seed Workflow

- Initial additive SQL migration: `src/db/migrations/0000_rapid_black_queen.sql` (uses `CREATE TABLE IF NOT EXISTS` and `CREATE [UNIQUE] INDEX IF NOT EXISTS`).
- Idempotent seed helpers: `src/db/seed/default-content.ts` and `src/db/seed/seed-database.ts` (`onConflictDoNothing()`).
- Commands:
  - Generate SQL migrations: `pnpm db:generate`
  - Apply to local D1: `pnpm db:migrate:local`
  - Apply to remote D1 (only after inspecting remote DB and reviewing SQL): `pnpm db:migrate:remote`
