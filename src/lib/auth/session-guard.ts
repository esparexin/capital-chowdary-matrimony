import { cookies } from "next/headers";
import {
  DEFAULT_SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/constants/security-constants";
import { getDatabase } from "@/db";
import { AppError } from "@/lib/utils/error-handler";
import { validateAdminSession, type AuthenticatedAdminUser } from "./session-service";
import { verifySignedSessionToken } from "./session-token";

export type { AuthenticatedAdminUser };

export interface AdminSessionCookieConfig {
  name: string;
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
}

export function getAdminSessionCookieConfig(): AdminSessionCookieConfig {
  return {
    name: process.env.ADMIN_SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

/**
 * Enforces presence and valid cryptographic signature of the administrator session cookie.
 */
export async function requireAdminSessionToken(): Promise<string> {
  const cookieStore = await cookies();
  const { name } = getAdminSessionCookieConfig();
  const sessionToken = cookieStore.get(name)?.value;

  if (!sessionToken) {
    throw new AppError("Administrator authentication is required.", 401, "UNAUTHORIZED");
  }

  const { valid } = await verifySignedSessionToken(sessionToken);
  if (!valid) {
    throw new AppError("Administrator session is invalid or has expired.", 401, "UNAUTHORIZED");
  }

  return sessionToken;
}

/**
 * Validates the administrator session against the D1 database and returns user details.
 */
export async function requireAuthenticatedAdmin(): Promise<AuthenticatedAdminUser> {
  const sessionToken = await requireAdminSessionToken();
  const db = await getDatabase();
  const result = await validateAdminSession(db, sessionToken);

  if (!result) {
    throw new AppError("Administrator session is invalid or has expired.", 401, "UNAUTHORIZED");
  }

  return result.user;
}
