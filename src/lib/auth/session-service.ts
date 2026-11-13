import { and, eq, isNull } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { adminSessions, adminUsers } from "@/db/schema";
import { SESSION_MAX_AGE_SECONDS } from "@/constants/security-constants";
import {
  createSignedSessionToken,
  generateSessionId,
  hashSessionToken,
  verifySignedSessionToken,
} from "./session-token";

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ValidatedSessionResult {
  user: AuthenticatedAdminUser;
  session: {
    id: string;
    expiresAt: string;
  };
}

export interface CreateSessionParams {
  adminUserId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  maxAgeSeconds?: number;
}

export interface CreatedSessionResult {
  token: string;
  expiresAt: string;
  sessionId: string;
}

/**
 * Creates and persists a signed session token for an authenticated administrator.
 */
export async function createAdminSession(
  db: AppDatabase,
  params: CreateSessionParams,
): Promise<CreatedSessionResult> {
  const sessionId = generateSessionId();
  const tokenHash = await hashSessionToken(sessionId);
  const token = await createSignedSessionToken(sessionId);
  const maxAge = params.maxAgeSeconds ?? SESSION_MAX_AGE_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString();
  const recordId = crypto.randomUUID();

  await db.insert(adminSessions).values({
    id: recordId,
    adminUserId: params.adminUserId,
    tokenHash,
    expiresAt,
    revokedAt: null,
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
  });

  return { token, expiresAt, sessionId };
}

/**
 * Validates a signed session token against D1 session records and user status.
 */
export async function validateAdminSession(
  db: AppDatabase,
  token: string,
  now = new Date(),
): Promise<ValidatedSessionResult | null> {
  const verification = await verifySignedSessionToken(token);
  if (!verification.valid || !verification.sessionId) {
    return null;
  }

  const tokenHash = await hashSessionToken(verification.sessionId);

  const [sessionRecord] = await db
    .select({
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
      revokedAt: adminSessions.revokedAt,
      userId: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.adminUserId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, tokenHash), isNull(adminSessions.revokedAt)))
    .limit(1);

  if (!sessionRecord || !sessionRecord.isActive) {
    return null;
  }

  const expiry = new Date(sessionRecord.expiresAt);
  if (expiry <= now) {
    return null;
  }

  return {
    user: {
      id: sessionRecord.userId,
      email: sessionRecord.email,
      name: sessionRecord.name,
      role: sessionRecord.role,
    },
    session: {
      id: sessionRecord.sessionId,
      expiresAt: sessionRecord.expiresAt,
    },
  };
}

/**
 * Marks a session token as revoked in D1.
 */
export async function revokeAdminSession(db: AppDatabase, token: string): Promise<void> {
  const verification = await verifySignedSessionToken(token);
  if (!verification.valid || !verification.sessionId) {
    return;
  }

  const tokenHash = await hashSessionToken(verification.sessionId);
  await db
    .update(adminSessions)
    .set({
      revokedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(adminSessions.tokenHash, tokenHash));
}
