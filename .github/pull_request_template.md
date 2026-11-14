## 1. Description & Purpose of Change

<!-- Provide a concise explanation of what this PR introduces or resolves. -->

## 2. Problem Category & Scope Compliance

- [ ] One PR = one problem category
- [ ] No cross-cutting refactors
- [ ] No unapproved business logic changes
- [ ] No unapproved API contract changes
- [ ] No unapproved UI redesigns
- [ ] Maximum file length: all modified/created files are <= 250 lines
- [ ] No dummy, zombie, dead, or duplicate code introduced

## 3. Files & Modules Affected

- **Affected Directories:**
- **Files Modified / Created:**

## 4. Architectural & Layer Impact

- **Server vs. Client Boundaries:** Are `"use client"` components free of server/DB imports?
  - [ ] Yes
  - [ ] N/A
- **Lower-to-Higher Layer Integrity:** Do `features/` or `lib/` avoid importing from `app/`?
  - [ ] Yes
  - [ ] N/A

## 5. Single Source of Truth (SSOT) Impact

- [ ] Utilizes authoritative Zod schemas (`src/lib/validations/` or `src/features/*/`)
- [ ] Utilizes authoritative database types (`src/types/database-types.ts`)
- [ ] Utilizes authoritative API response format (`src/types/api-response.ts`)
- [ ] No duplicate constants, locales, or route definitions introduced

## 6. API Contract Impact

- [ ] No breaking contract changes
- [ ] Standard `{ ok: true, data: ... }` / `{ ok: false, error: ... }` envelope preserved
- [ ] Proper HTTP status codes returned (200, 201, 400, 401, 403, 404, 429, 500)

## 7. Database & Migration Impact

- [ ] No destructive SQL migrations (`DROP TABLE`, `DROP COLUMN`)
- [ ] Migrations use `IF NOT EXISTS` / non-destructive schema evolutions
- [ ] Remote D1 migrations were NOT executed in development / CI
- [ ] N/A (no database changes)

## 8. UI/UX & Accessibility Impact

- [ ] Bilingual support: English (`en`) and Telugu (`te`) maintained
- [ ] Responsive design verified (Desktop, Tablet, Mobile)
- [ ] Semantic HTML and accessibility (`aria-*`, form labels, keyboard navigation) verified
- [ ] Cloudinary used for all image delivery (no binary images committed)
- [ ] Screenshots / recordings attached for visual changes (if applicable)

## 9. Security & Secret Hygiene

- [ ] Zero secrets, private keys, or `.env` credentials committed
- [ ] Server secrets (`AUTH_SESSION_SECRET`, `CLOUDINARY_API_SECRET`) isolated from client
- [ ] CSRF, Rate Limiting, and Session Guards applied to protected endpoints

## 10. Verification & Test Evidence

Check all executed checks with proof:

- [ ] `pnpm run check:governance` (All architectural gates passed)
- [ ] `pnpm typecheck` (TypeScript strict mode passed)
- [ ] `pnpm lint` (ESLint Next.js Core Web Vitals passed)
- [ ] `pnpm format:check` (Prettier code style passed)
- [ ] `pnpm test` (Unit and integration test suite passed)
- [ ] `pnpm build` (Next.js production build succeeded)
- [ ] `pnpm build:worker` (OpenNext Cloudflare Worker bundle succeeded)
