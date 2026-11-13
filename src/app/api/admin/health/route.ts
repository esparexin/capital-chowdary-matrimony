import { NextResponse } from "next/server";
import { requireAuthenticatedAdmin, type AuthenticatedAdminUser } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { toApiErrorResponse } from "@/lib/utils/error-handler";
import type { ApiResponse } from "@/types/api-response";

interface AdminHealthPayload {
  status: "authorized";
  authenticated: true;
  user: AuthenticatedAdminUser;
}

export async function GET(): Promise<NextResponse<ApiResponse<AdminHealthPayload>>> {
  try {
    const user = await requireAuthenticatedAdmin();
    const response = NextResponse.json<ApiResponse<AdminHealthPayload>>({
      ok: true,
      data: {
        status: "authorized",
        authenticated: true,
        user,
      },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/health");
    const response = NextResponse.json<ApiResponse<AdminHealthPayload>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
