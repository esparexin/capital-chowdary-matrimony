# Agent Instructions & Execution Policy — Capital Chowdary Matrimony

## 1. System Scope & Architecture

- **Project Purpose:** Informational matrimonial platform with a private administrative content-management dashboard supporting **English (`en`)** and **Telugu (`te`)**.
- **Strict Scope Boundaries:**
  - **NO customer accounts, user login, profile browsing, or matchmaking algorithms.**
  - **NO customer payments or CRM integration.**
  - **Bride/Groom Registration:** Form inputs are validated client- and schema-side with Zod and redirect directly to WhatsApp with a prefilled message. Registrations are **never** persisted in Cloudflare D1.
  - **Private Administrator Only:** Single administrator manages bilingual pages, homepage hero sections, services, pricing plans, marriage events, gallery assets, SEO metadata, legal content, and site settings.
- **Technology Stack:**
  - Framework: Next.js 16 (App Router) with React 19 Server Components by default.
  - Runtime: Cloudflare Workers via `@opennextjs/cloudflare`.
  - Database: Cloudflare D1 via `drizzle-orm` (SQLite dialect).
  - Media & Storage: Cloudinary REST API with WebCrypto SHA-1 signatures (`res.cloudinary.com`).
  - Styling: Tailwind CSS v4.

---

## 2. Directory Navigation & Search Exclusions

### Never Scan the Following Directories
- `.next/` (Build artifacts, Turbopack cache, traces)
- `.open-next/` (Worker bundle output)
- `node_modules/` (Dependencies — 50,000+ files)
- `.wrangler/` (Local worker state and logs)
- `coverage/` / `.vitest/` (Test outputs)

### Large Generated Files to Ignore During Audits
- `cloudflare-env.d.ts` (626 KB generated Cloudflare types)
- `tsconfig.tsbuildinfo` (TypeScript incremental build cache)
- `ccm-logo.png` (Local binary logo asset)

### Search Best Practice
**NEVER execute unconstrained root searches** such as `grep -rn "keyword" .` or `find .`.
Always target specific source directories:
```bash
grep -rn "keyword" src tests scripts docs
find src tests scripts docs -type f
```

---

## 3. Directory Map

- `src/app/(public)/`: Public informational pages (About, Contact, Events, How It Works, Pricing, Privacy, Register, Services, Terms).
- `src/app/admin/(protected)/`: Private administrative CMS pages (Dashboard, Events, Gallery, Homepage, Pages, Pricing, Services, Settings).
- `src/app/api/admin/`: Protected admin CRUD and Cloudinary upload signature endpoints.
- `src/app/api/public/`: Public health check endpoint.
- `src/components/`: Reusable UI components (`ui/`), layouts (`layout/`), public sections (`public/`), admin managers (`admin/`), forms (`forms/`), and shared icons (`shared/`).
- `src/features/`: Feature-sliced domain modules (`cms`, `contact`, `homepage`, `pricing`, `registration`).
- `src/lib/`: Core infrastructure (`auth`, `cloudinary`, `database`, `security`, `utils`, `validations`).
- `src/db/`: Drizzle schemas, migrations, and D1 database client.
- `tests/`: Unit and integration test suites mirroring source structure (`tests/unit/`, `tests/integration/`).
- `docs/`: System documentation (`architecture.md`, `coding-standards.md`, `database-schema.md`, `deployment-guide.md`).

---

## 4. Mandatory Task Execution Policy (10 Rules)

1. **Understand Before Exploring:** Define the precise goal and affected files before invoking any filesystem tools.
2. **Read Architecture First:** Always consult `docs/architecture.md` and `docs/coding-standards.md` before implementing or reviewing features.
3. **Target Specific Modules:** Restrict file reading and modifications strictly to the relevant domain folders.
4. **Targeted Searches Only:** Never run unconstrained root scans; always specify explicit directory targets.
5. **No Duplicate Operations:** Never re-run an identical tool command without a clear reason or state change.
6. **Targeted Tests First:** Always run the targeted test file first during development:
   ```bash
   npx vitest run tests/unit/<test-file>.test.ts
   ```
7. **Full Validation at Milestones Only:** Run full verification (`npm run typecheck`, `npm test`) only at commit or PR completion boundaries.
8. **Strict Zero-Scope-Creep:** Never refactor unrelated files or fix incidental issues found during an audit. Report them separately.
9. **Report Blockers Promptly:** If a build or permission failure repeats, halt execution and report the root cause rather than looping.
10. **Standardized Task Reporting:** Conclude every task with the standardized progress schema below.

---

## 5. Verification & Build Commands

- **Unit / Targeted Tests (Fast):** `npx vitest run tests/unit/<test-name>.test.ts` (~200ms)
- **Full Test Suite:** `npm test` (~3.0s, 28 test suites, 115 tests)
- **Type Checking:** `npm run typecheck` (~1.9s)
- **Production Build:** `npm run build` (~5.8s)
  *Note:* In sandboxed terminal environments, Next.js / `@opennextjs/cloudflare` requires permission to access Wrangler preference logs at `~/Library/Preferences/.wrangler`. If sandboxed, run with sandbox bypass or rely on `npm run typecheck` + `npm test` for fast intermediate gates.

---

## 6. Standard Task Report Schema

For all completed tasks, provide this structured report:
- **Objective:** What was requested and solved.
- **Files Inspected:** Paths of files read.
- **Files Modified:** Paths of files created or edited.
- **Commands Executed:** Key terminal commands with execution outcomes.
- **Tests Executed:** Targeted test and full test verification results.
- **Issues Identified:** Categorized findings (Security, Performance, Quality, Blockers).
- **Time Spent:** Duration or turnaround time.
- **Remaining Work:** Any outstanding follow-ups.
