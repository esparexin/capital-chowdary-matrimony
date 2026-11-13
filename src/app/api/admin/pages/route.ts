import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDatabase } from "@/db";
import { pages } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { toApiErrorResponse } from "@/lib/utils/error-handler";
import type { ApiResponse } from "@/types/api-response";
import type { Page } from "@/types/database-types";

export async function GET(): Promise<NextResponse<ApiResponse<Page[]>>> {
  try {
    await requireAuthenticatedAdmin();
    const db = await getDatabase();

    const rows = await db.select().from(pages).orderBy(asc(pages.slug));

    const response = NextResponse.json<ApiResponse<Page[]>>({
      ok: true,
      data: rows,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/pages");
    const response = NextResponse.json<ApiResponse<Page[]>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
