# Deployment Guide — Cloudflare Workers & D1

## 1. Prerequisites

- Node.js 22+ and `pnpm` 11+
- Authenticated Wrangler CLI (`pnpm exec wrangler login`)
- Existing Cloudflare D1 database: `capital-chowdary-matrimony`
- Cloudinary account (cloud name, API key, API secret)

## 2. Configuration Checklist

1. Update `database_id` in `wrangler.jsonc` with your provisioned `capital-chowdary-matrimony` D1 database UUID.
2. Copy `.env.example` to `.dev.vars` for local Workers preview and configure production secrets via `wrangler secret put`:
   - `AUTH_SESSION_SECRET`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Apply D1 migrations remotely before deploying:
   ```bash
   pnpm db:migrate:remote
   ```

## 3. Build, Preview, and Deploy

```bash
# Next.js production build
pnpm build

# OpenNext Cloudflare Worker bundle
pnpm build:worker

# Local Workers runtime preview (Miniflare + local D1)
pnpm preview

# Deploy to Cloudflare Workers
pnpm deploy
```
