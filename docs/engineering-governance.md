# Engineering Governance & Code Quality Architecture — Capital Chowdary Matrimony

## 1. Governance Overview & Policy

Capital Chowdary Matrimony enforces a **STRICT** engineering governance policy across all frontend, backend, database, configuration, infrastructure, and documentation assets.

The governance system ensures:

- Full compliance with established Next.js 16 (App Router), React 19, Cloudflare Workers (`@opennextjs/cloudflare`), and Cloudflare D1 architectures.
- Prevention of dummy, placeholder, zombie, orphaned, hardcoded, duplicated, or unmaintainable code.
- Strict isolation of server-side data access and secrets from client bundles.
- Preservation of Single Source of Truth (SSOT) principles without duplicate or competing schemas.
- Continuous automated quality enforcement via GitHub Actions CI/CD workflows and local pre-push scripts.

---

## 2. Automated GitHub Actions Pipelines

The repository features four dedicated, decoupled workflows under `.github/workflows/`:

| Workflow                    | File                                 | Triggers                                                 | Primary Objectives                                                                                                                                                                                        |
| :-------------------------- | :----------------------------------- | :------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Main CI**                 | `.github/workflows/ci.yml`           | PRs to `main`, pushes to `feat/**`, `fix/**`, `chore/**` | Node 22/pnpm 11 setup, frozen lockfile, environment verification, Prettier, ESLint, TypeScript typecheck, Vitest test suite, Next.js production build, OpenNext Cloudflare Worker build, artifact upload. |
| **Security Pipeline**       | `.github/workflows/security.yml`     | PRs to `main`, pushes to branches, weekly cron           | TruffleHog secret scanning, repository security hygiene check, `pnpm audit` (high/critical CVEs), lockfile integrity check, PR dependency review.                                                         |
| **Architecture Governance** | `.github/workflows/architecture.yml` | PRs to `main`, pushes to branches                        | Maximum file length (<= 250 lines), boundary enforcement, server/client isolation, prohibited generic filenames ban, strict TypeScript (`any` & `@ts-` ban), SSOT verification.                           |
| **UI/UX Quality Pipeline**  | `.github/workflows/ui-ux.yml`        | PRs to `main`, pushes to branches                        | Navigation route resolution, bilingual (EN/TE) content completeness, accessible form validation, WhatsApp deep-link generation, admin authentication & session security.                                  |

---

## 3. Local Pre-Push Governance Commands

Engineers can execute the identical gates locally before pushing changes:

```bash
# Comprehensive governance gate (runs all checks below)
pnpm run check:governance

# Individual checks
pnpm run check:file-length    # Validates max 250 lines per source file
pnpm run check:architecture   # Validates client/server boundaries and TypeScript safety
pnpm run check:ssot           # Validates Single Source of Truth across routes, schemas, and types
pnpm run check:security       # Validates secret isolation and gitignore hygiene
pnpm run test:ui-ux           # Validates UI/UX navigation, accessibility, and bilingual contracts
```

---

## 4. Single Source of Truth (SSOT) & Contracts Architecture

### Current Repository Architecture

The repository operates as a single unified Next.js + Cloudflare Workers project. An audit of the codebase confirms that creating a separate `packages/contracts` monorepo package is neither required nor beneficial at this stage because:

1. All client and server modules coexist within `src/` under strict path aliases (`@/*`).
2. Splitting into a monorepo would introduce unnecessary workspace tooling overhead (`turbo`, `wireit`, cross-package linking) without architectural gain for a single application deployment.

### Authoritative SSOT Definitions

| Business Concept       | Authoritative Single Source of Truth                     | Consumers                                                   |
| :--------------------- | :------------------------------------------------------- | :---------------------------------------------------------- |
| **API Responses**      | `src/types/api-response.ts`                              | All API route handlers (`/api/**`) and client fetchers      |
| **Bilingual Locales**  | `src/constants/locales.ts` & `src/types/locale-types.ts` | Header, Language Switcher, Seed data, CMS                   |
| **Navigation & Links** | `src/constants/navigation.ts`                            | `SiteHeader`, `MobileNavDrawer`, `SiteFooter`, `AdminShell` |
| **Form Validations**   | `src/lib/validations/` & `src/features/registration/`    | Client forms (`RegistrationForm`), Server handlers          |
| **Database Entities**  | `src/db/schema/` & `src/types/database-types.ts`         | D1 client, Drizzle repositories, seed scripts               |
| **Environment Config** | `src/config/env-config.ts`                               | `getServerEnv()` (server-only), `getClientEnv()`            |
| **Media Delivery**     | `src/lib/cloudinary/` & `media_assets` D1 table          | Cloudinary signed upload routes, Next.js image components   |

---

## 5. Coding & Layering Standards

1. **Maximum File Length:** 250 lines. Files approaching 230 lines generate architectural warnings. Files exceeding 250 lines fail CI.
2. **Modular Layering:**
   - `src/app/`: Presentation routes and API route handlers.
   - `src/components/`: Reusable presentational components (primitives, layout, forms, admin, shared).
   - `src/features/`: Domain-sliced features (`registration`, `homepage`, `contact`, `cms`, `pricing`).
   - `src/lib/`: Cross-cutting technical infrastructure (`auth`, `cloudinary`, `database`, `security`, `validations`, `utils`).
   - `src/db/`: Database schemas, migrations, and D1 runtime client.
3. **Forbidden Generic Filenames:** Generic catch-alls (`data.ts`, `common.ts`, `helper.ts`, `utils.ts`) are banned. All files must have descriptive, intention-revealing names.
4. **TypeScript Strictness:** `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`. The use of `any` and `@ts-` suppression directives is prohibited in `src/`.

---

## 6. Cloudflare Deployment & Safety Policy

- **Manual-Only Cloudflare Deployment:** Automatic CI deployments to Cloudflare Workers or D1 are strictly prohibited.
- **Never Run Remote Migrations in CI:** Remote D1 migrations (`pnpm db:migrate:remote`) must only be executed by an authenticated administrator after inspecting the target database and reviewing the SQL diff.
- **Zero Production Secret Exposure:** Production secrets (`AUTH_SESSION_SECRET`, `CLOUDINARY_API_SECRET`, Cloudflare tokens) are never configured in CI or committed to Git. CI builds use `.env.example` and `.dev.vars.example` mocks.

---

## 7. Recommended GitHub Branch Protection Settings

Repository administrators should apply the following branch protection rules for the `main` branch via **Settings > Branches > Add branch protection rule**:

1. **Branch name pattern:** `main`
2. **Protect matching branches:**
   - [x] **Require a pull request before merging**
     - Require approvals: `1`
     - Dismiss stale pull request approvals when new commits are pushed: `Checked`
     - Require review from Code Owners: `Checked`
   - [x] **Require status checks to pass before merging**
     - Require branches to be up to date before merging: `Checked`
     - Required status checks:
       - `Code Quality & Build Verification` (`ci.yml`)
       - `Secret & Credential Scanning` (`security.yml`)
       - `Dependency Audit & Lockfile Integrity` (`security.yml`)
       - `Architecture & SSOT Enforcement` (`architecture.yml`)
       - `UI/UX Standards, Accessibility & Bilingual Verification` (`ui-ux.yml`)
   - [x] **Require conversation resolution before merging**
   - [x] **Require signed commits** (recommended)
   - [x] **Require linear history**
   - [x] **Do not allow bypassing the above settings**
