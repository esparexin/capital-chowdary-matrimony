import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { adminUsers } from "@/db/schema";
import { dummyPasswordVerification, verifyPassword } from "@/lib/auth/password-hasher";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/auth/rate-limiter";
import { getAdminSessionCookieConfig } from "@/lib/auth/session-guard";
import { createAdminSession, type AuthenticatedAdminUser } from "@/lib/auth/session-service";
import { extractClientIp } from "@/lib/security/client-ip";
import { verifySameOrigin } from "@/lib/security/origin-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { logEvent } from "@/lib/utils/structured-logger";
import { adminLoginSchema } from "@/lib/validations/admin-auth-schema";
import type { ApiResponse } from "@/types/api-response";

interface LoginSuccessData {
  user: AuthenticatedAdminUser;
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<LoginSuccessData>>> {
  const clientIp = extractClientIp(request.headers);
  const userAgent = request.headers.get("user-agent") || "";

  try {
    if (!verifySameOrigin(request)) {
      throw new AppError("Invalid request origin.", 403, "FORBIDDEN");
    }

    const json = await request.json().catch(() => null);
    const { email, password } = adminLoginSchema.parse(json);
    const rateLimitKey = `login:${clientIp}:${email}`;

    const db = await getDatabase();

    const rateLimitCheck = await checkRateLimit(db, rateLimitKey);
    if (!rateLimitCheck.allowed) {
      logEvent("warn", "Admin login rate limit active", { clientIp, email });
      const retryMinutes = Math.ceil(rateLimitCheck.retryAfterSeconds / 60);
      const response = NextResponse.json<ApiResponse<LoginSuccessData>>(
        {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: `Too many login attempts. Please try again in ${retryMinutes} minute${retryMinutes === 1 ? "" : "s"}.`,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitCheck.retryAfterSeconds),
          },
        },
      );
      applySecurityHeaders(response.headers);
      return response;
    }

    const [user] = await db
      .select()
      .from(adminUsers)
      .where(and(eq(adminUsers.email, email), eq(adminUsers.isActive, true)))
      .limit(1);

    if (!user) {
      await dummyPasswordVerification();
      await recordFailedAttempt(db, rateLimitKey);
      logEvent("warn", "Admin login failed: unknown or inactive user", { clientIp, email });
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      const attempt = await recordFailedAttempt(db, rateLimitKey);
      logEvent("warn", "Admin login failed: incorrect password", {
        clientIp,
        email,
        remainingAttempts: attempt.remainingAttempts,
      });
      throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
    }

    await resetRateLimit(db, rateLimitKey);

    const nowIso = new Date().toISOString();
    await db
      .update(adminUsers)
      .set({ lastLoginAt: nowIso, updatedAt: nowIso })
      .where(eq(adminUsers.id, user.id));

    const session = await createAdminSession(db, {
      adminUserId: user.id,
      ipAddress: clientIp,
      userAgent,
    });

    const response = NextResponse.json<ApiResponse<LoginSuccessData>>({
      ok: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });

    const cookieConfig = getAdminSessionCookieConfig();
    response.cookies.set({
      name: cookieConfig.name,
      value: session.token,
      httpOnly: cookieConfig.httpOnly,
      sameSite: cookieConfig.sameSite,
      secure: cookieConfig.secure,
      path: cookieConfig.path,
      maxAge: cookieConfig.maxAge,
    });

    applySecurityHeaders(response.headers);
    logEvent("info", "Admin login succeeded", { clientIp, email, userId: user.id });
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/login");
    const response = NextResponse.json<ApiResponse<LoginSuccessData>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
