# Coding Standards — Capital Chowdary Matrimony

## 1. Naming Conventions

- **Components:** `PascalCase` (`SiteHeader.tsx`, `RoutePlaceholder.tsx`)
- **Hooks:** `camelCase` with `use` prefix (`useLocale.ts`, `useValidatedForm.ts`)
- **Functions & Variables:** `camelCase` (`getDatabase()`, `buildCloudinaryImageUrl()`)
- **Constants:** `UPPER_SNAKE_CASE` (`DEFAULT_LOCALE`, `PUBLIC_NAV_ITEMS`)
- **Types & Interfaces:** `PascalCase` (`Locale`, `ApiResponse`)
- **Database Tables & Columns:** `snake_case` (`content_sections`, `created_at`)
- **Folders & API Endpoints:** lowercase `kebab-case` (`content-management/`, `/api/admin/homepage-sections`)
- **Environment Variables:** `UPPER_SNAKE_CASE` (`CLOUDINARY_API_SECRET`)
- **Tests:** descriptive `kebab-case` with `.test.ts` (`cloudinary-client.test.ts`)
- **Forbidden generic filenames:** Avoid `data.ts`, `common.ts`, `helper.ts`, or catch-all `utils.ts`.

## 2. Engineering Rules

- TypeScript `strict: true` with `noUncheckedIndexedAccess: true`; never use `any`.
- Server Components by default; add `"use client"` only for interactive hooks, forms, or Framer Motion wrappers.
- Validate all external/API inputs with Zod (`src/lib/validations/`).
- Keep database access strictly in server-side data-access modules (`src/db/` and feature repositories).
- Never import `getServerEnv()` or `CLOUDINARY_API_SECRET` in client code.
- Use `logEvent()` (`src/lib/utils/structured-logger.ts`) and `AppError` / `toApiErrorResponse()` (`src/lib/utils/error-handler.ts`) for centralized observability and error responses.
