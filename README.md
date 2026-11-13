# Capital Chowdary Matrimony

Informational matrimonial website and private bilingual (English / Telugu) content-management dashboard built with Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Cloudflare D1, Cloudflare Workers (`@opennextjs/cloudflare`), and Cloudinary.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Start local Next.js dev server (with OpenNext Cloudflare dev bindings)
pnpm dev
```

## Verification Commands

```bash
pnpm typecheck     # TypeScript strict check
pnpm lint          # ESLint (Next.js Core Web Vitals + TypeScript)
pnpm format:check  # Prettier formatting check
pnpm test          # Vitest unit & integration tests
pnpm build         # Next.js production build
pnpm build:worker  # OpenNext Cloudflare Worker bundle build
```

See `docs/` for architecture, database, API, deployment, and coding standards documentation.
