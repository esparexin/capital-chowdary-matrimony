# Architecture — Capital Chowdary Matrimony

## 1. System Overview

**Capital Chowdary Matrimony** is an informational matrimonial platform with a private content-management dashboard supporting **English (`en`)** and **Telugu (`te`)**.

- **No customer accounts, profile browsing, matchmaking, payments, or CRM.**
- **Bride/Groom registration** validates input client- and schema-side with Zod and redirects directly to WhatsApp with a prefilled message (no submission persistence in D1).
- **Single private administrator** manages bilingual pages, homepage sections, services, pricing plans, marriage events, gallery assets, SEO metadata, legal content, and site settings.

## 2. Verified Compatibility & Deployment Approach

| Layer                 | Package / Version                             | Notes                                                                                       |
| --------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Framework             | `next@16.4.6` (App Router)                    | Server Components by default; React `19.3.1`                                                |
| Workers Adapter       | `@opennextjs/cloudflare@^1.20.17`             | Supports Next.js `>=15.5.29 <16 \|\| >=16.4.5`; replaces legacy `@cloudflare/next-on-pages` |
| Workers CLI / Runtime | `wrangler@^4.161.0`                           | `nodejs_compat` + `global_fetch_strictly_public`                                            |
| Database              | Cloudflare D1 (`capital-chowdary-matrimony`)  | Serverless SQLite accessed via `env.DB` binding                                             |
| ORM / Migrations      | `drizzle-orm@^0.45.4`, `drizzle-kit@^0.31.11` | `drizzle-orm/d1` runtime client; SQLite dialect migrations                                  |
| Media                 | Cloudinary REST + signed uploads              | WebCrypto SHA-1 signature server-side; zero SDK bloat                                       |

### Key Compatibility Decisions

1. **`@opennextjs/cloudflare` over `@cloudflare/next-on-pages`:** Full Next.js 16 App Router, Route Handlers, Server Actions, and Node.js compatibility layer on Cloudflare Workers.
2. **Password Hashing on Cloudflare Workers:** Native C++/N-API Argon2 packages (`argon2`, `@node-rs/argon2`) are unsupported in Workers V8 isolates, and heavy WASM Argon2id risks exceeding Workers CPU time limits. The security module will use Workers-native cryptographic hashing (`crypto.subtle` PBKDF2-SHA256 / `node:crypto` `scrypt`) with constant-time comparison and per-user random salts.
3. **Cloudinary Integration:** Uses native `fetch` and `crypto.subtle` for signed uploads and `res.cloudinary.com` delivery URLs (`buildCloudinaryImageUrl`), avoiding Node-only HTTP/stream dependencies.

## 3. Centralized Media & Image Storage Architecture (SSOT)

- **Single Media Provider:** Cloudinary is the sole storage and CDN delivery provider for all website images (Gallery photos, marriage event covers, Muhurtham calendar charts, and homepage banners).
- **Zero Binary Data in Database:** Cloudflare D1 stores only application data and asset metadata (`media_assets` table: `cloudinary_public_id`, `secure_url`, format, dimensions, alt text, admin ID). No image blobs are stored in D1.
- **Automated Subfolder Provisioning:** Signed uploads automatically route into organized categories under `CLOUDINARY_UPLOAD_FOLDER` (`gallery`, `events`, `banners`, `profiles`), provisioning folders automatically via Cloudinary's Upload API.
- **Synchronized Deletion:** Deleting an image in the admin workspace triggers `deleteCloudinaryAsset()` to purge the physical asset from Cloudinary storage via its Destroy API before cleaning up D1 records, preventing orphaned files.
- **Environment Parity:** Credentials (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_FOLDER`) are configured via `.env.local` (local Next.js), `.dev.vars` (local Wrangler), and Cloudflare Worker environment variables in production.

## 4. Directory Responsibilities

- `src/app/(public)/`: Public informational pages sharing header/footer shell.
- `src/app/admin/`: Private administrator login and `(protected)` content management routes.
- `src/app/api/public/` & `src/app/api/admin/`: Public and session-protected Route Handlers.
- `src/components/`: Reusable UI primitives (`ui/`), layout shells (`layout/`), route wrappers (`public/`, `admin/`), form helpers (`forms/`), and shared motion/placeholders (`shared/`).
- `src/features/`: Feature-sliced domain modules (`homepage`, `services`, `pricing`, `events`, `gallery`, `registration`, `contact`, `cms`).
- `src/lib/`: Cross-cutting infrastructure (`auth/`, `cloudinary/`, `database/`, `security/`, `validations/`, `utils/`).
- `src/db/`: Drizzle schema, D1 client factory (`getDatabase()`), migrations, and seeders.
- `src/config/`, `src/constants/`, `src/types/`, `src/hooks/`: Typed configuration, constants, TypeScript interfaces, and client hooks.
