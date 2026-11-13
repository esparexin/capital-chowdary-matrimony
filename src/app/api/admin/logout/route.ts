import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDatabase } from "@/db";
import { getAdminSessionCookieConfig } from "@/lib/auth/session-guard";
import { revokeAdminSession } from "@/lib/auth/session-service";
import { verifySameOrigin } from "@/lib/security/origin-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { logEvent } from "@/lib/utils/structured-logger";
import type { ApiResponse } from "@/types/api-response";

interface LogoutSuccessData {
  loggedOut: true;
}

function extractCookieFromHeaders(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  const value = match?.[1];
  return value ? decodeURIComponent(value) : undefined;
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<LogoutSuccessData>>> {
  try {
    if (!verifySameOrigin(request)) {
      throw new AppError("Invalid request origin.", 403, "FORBIDDEN");
    }

    const cookieConfig = getAdminSessionCookieConfig();
    let sessionToken = extractCookieFromHeaders(request.headers.get("cookie"), cookieConfig.name);

    if (!sessionToken) {
      try {
        const cookieStore = await cookies();
        sessionToken = cookieStore.get(cookieConfig.name)?.value;
      } catch {
        // Fall back gracefully when outside Next cookies() store context
      }
    }

    if (sessionToken) {
      try {
        const db = await getDatabase();
        await revokeAdminSession(db, sessionToken);
      } catch (err) {
        logEvent("warn", "Failed to revoke session during logout", {
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const response = NextResponse.json<ApiResponse<LogoutSuccessData>>({
      ok: true,
      data: {
        loggedOut: true,
      },
    });

    response.cookies.set({
      name: cookieConfig.name,
      value: "",
      httpOnly: cookieConfig.httpOnly,
      sameSite: cookieConfig.sameSite,
      secure: cookieConfig.secure,
      path: cookieConfig.path,
      maxAge: 0,
    });

    applySecurityHeaders(response.headers);
    logEvent("info", "Admin logout successful");
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/logout");
    const response = NextResponse.json<ApiResponse<LogoutSuccessData>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
