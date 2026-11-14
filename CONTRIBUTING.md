# Contributing to Capital Chowdary Matrimony

Thank you for contributing to **Capital Chowdary Matrimony**. This project adheres to a **STRICT Engineering Governance Policy** to maintain high standards of code quality, security, and architectural integrity.

---

## 1. Absolute Safety & Scope Rules

1. **Never modify `main` directly.** All contributions must originate from a focused branch (`feat/*`, `fix/*`, `chore/*`) targeting `main`.
2. **One PR = One Problem Category.** Cross-cutting refactors, sweeping renames, or mixing UI redesign with backend fixes are prohibited.
3. **No Unapproved Business Logic or API Changes.** The platform is an informational bureau service with a private admin CMS. Customer account registration, profile browsing, or payment gateway integration is strictly out of scope.
4. **No Destructive Database Migrations.** Never write destructive SQL (`DROP TABLE`, `DROP COLUMN`). Remote migrations are never run from CI or feature branches.
5. **No Committed Secrets or Private Data.** Never commit `.env.local`, `.dev.vars`, Cloudflare tokens, or Cloudinary secrets.
6. **Maximum File Length: 250 Lines.** All source files under `src/` must remain at or below 250 lines. Keep components and functions focused and modular.
7. **Zero TypeScript `any` and Zero `@ts-` Directives.** Strict TypeScript typing is required.

---

## 2. Architecture & Layering Rules (SSOT)

- **Server Components by Default:** Next.js App Router server components are the default. Add `"use client"` only for components requiring interactivity, state, or client hooks.
- **Client/Server Isolation:** Client components must never import server-only modules (`@/db`, `@/lib/database`, `@/lib/auth/password-hasher`, `getServerEnv`).
- **Single Source of Truth (SSOT):**
  - Validation: Define inputs once using Zod under `src/lib/validations/` or `src/features/*/`.
  - Database Models: Infer types directly from Drizzle schemas (`src/types/database-types.ts`).
  - API Responses: Always return standard envelopes (`ApiResponse<T>`) defined in `src/types/api-response.ts`.
  - Navigation: All navigation items live in `src/constants/navigation.ts`.
  - Locales: Supported languages are strictly English (`en`) and Telugu (`te`) (`src/constants/locales.ts`).
- **Centralized Media (Cloudinary):** Cloudflare D1 stores only image metadata (`media_assets` table). All physical images are stored in Cloudinary via signed uploads. Zero binary images may be committed to the repository.

---

## 3. Local Development & Mandatory Quality Gates

Before opening a pull request, run the comprehensive verification suite locally:

```bash
# 1. Run all architectural and governance gates
pnpm run check:governance

# 2. TypeScript strict typecheck
pnpm typecheck

# 3. ESLint (Next.js Core Web Vitals + TypeScript)
pnpm lint

# 4. Prettier formatting check
pnpm format:check

# 5. Full test suite (Unit & Integration)
pnpm test

# 6. Production Next.js build
pnpm build

# 7. OpenNext Cloudflare Worker bundle build
pnpm build:worker
```

All commands must exit cleanly with code `0`.

---

## 4. Pull Request Workflow

1. **Branch Naming:**
   - Features: `feat/short-descriptive-title`
   - Bug fixes: `fix/short-descriptive-title`
   - Governance & Maintenance: `chore/short-descriptive-title`
2. **Commit Messages:** Follow conventional commits:
   - `feat(scope): concise summary`
   - `fix(scope): concise summary`
   - `chore(scope): concise summary`
3. **PR Template:** Complete every section of `.github/pull_request_template.md`. PRs with unchecked or fabricated test results will not be reviewed.
4. **CI Verification:** Every PR must pass all GitHub Actions pipelines (`ci.yml`, `security.yml`, `architecture.yml`, `ui-ux.yml`) before merge approval.
