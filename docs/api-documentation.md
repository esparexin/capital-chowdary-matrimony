# API Documentation

All API endpoints live under `src/app/api/` using lowercase `kebab-case` paths and return a consistent envelope (`src/types/api-response.ts`):

```json
{
  "ok": true,
  "data": {}
}
```

Error responses return:

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "fieldErrors": {}
  }
}
```

## Foundation Endpoints

| Method | Path                 | Access        | Description                                                                       |
| ------ | -------------------- | ------------- | --------------------------------------------------------------------------------- |
| `GET`  | `/api/public/health` | Public        | Returns service health and timestamp with security headers.                       |
| `GET`  | `/api/admin/health`  | Admin Session | Verifies administrator session cookie presence (`401 UNAUTHORIZED` when missing). |

## Planned Admin & Public Endpoints

Future modules will add:

- `/api/admin/auth/login` and `/api/admin/auth/logout` (rate-limited login, HttpOnly `SameSite=Lax` cookie)
- `/api/admin/homepage-sections`, `/api/admin/pages`, `/api/admin/services`, `/api/admin/pricing-plans`, `/api/admin/events`, `/api/admin/gallery`, `/api/admin/settings`
- `/api/admin/media/sign` (server-side Cloudinary upload signature)
- `/api/public/content` (read-only published bilingual content)
