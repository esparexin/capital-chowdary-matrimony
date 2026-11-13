import { eq } from "drizzle-orm";
import type { AppDatabase } from "@/db";
import { loginRateLimits } from "@/db/schema";
import {
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  LOGIN_RATE_LIMIT_WINDOW_SECONDS,
} from "@/constants/security-constants";

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds: number;
  locked: boolean;
}

export interface FailedAttemptResult {
  locked: boolean;
  retryAfterSeconds: number;
  remainingAttempts: number;
}

/**
 * Checks if an authentication attempt is permitted under the sliding-window rate limit.
 */
export async function checkRateLimit(
  db: AppDatabase,
  key: string,
  now = new Date(),
): Promise<RateLimitCheckResult> {
  const [record] = await db
    .select()
    .from(loginRateLimits)
    .where(eq(loginRateLimits.key, key))
    .limit(1);

  if (!record) {
    return { allowed: true, retryAfterSeconds: 0, locked: false };
  }

  if (record.lockedUntil) {
    const lockExpiry = new Date(record.lockedUntil);
    if (lockExpiry > now) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((lockExpiry.getTime() - now.getTime()) / 1000),
      );
      return { allowed: false, retryAfterSeconds, locked: true };
    }
  }

  const windowStart = new Date(record.windowStartedAt);
  const elapsedSeconds = (now.getTime() - windowStart.getTime()) / 1000;

  if (elapsedSeconds >= LOGIN_RATE_LIMIT_WINDOW_SECONDS) {
    return { allowed: true, retryAfterSeconds: 0, locked: false };
  }

  if (record.attemptCount >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    const remainingSeconds = Math.max(
      1,
      Math.ceil(LOGIN_RATE_LIMIT_WINDOW_SECONDS - elapsedSeconds),
    );
    return { allowed: false, retryAfterSeconds: remainingSeconds, locked: true };
  }

  return { allowed: true, retryAfterSeconds: 0, locked: false };
}

/**
 * Increments failed attempt count and applies a lockout if max attempts are exceeded.
 */
export async function recordFailedAttempt(
  db: AppDatabase,
  key: string,
  now = new Date(),
): Promise<FailedAttemptResult> {
  const [record] = await db
    .select()
    .from(loginRateLimits)
    .where(eq(loginRateLimits.key, key))
    .limit(1);

  const nowIso = now.toISOString();

  if (!record) {
    await db.insert(loginRateLimits).values({
      key,
      attemptCount: 1,
      windowStartedAt: nowIso,
      lockedUntil: null,
    });
    return {
      locked: false,
      retryAfterSeconds: 0,
      remainingAttempts: LOGIN_RATE_LIMIT_MAX_ATTEMPTS - 1,
    };
  }

  const windowStart = new Date(record.windowStartedAt);
  const elapsedSeconds = (now.getTime() - windowStart.getTime()) / 1000;

  if (elapsedSeconds >= LOGIN_RATE_LIMIT_WINDOW_SECONDS) {
    await db
      .update(loginRateLimits)
      .set({
        attemptCount: 1,
        windowStartedAt: nowIso,
        lockedUntil: null,
        updatedAt: nowIso,
      })
      .where(eq(loginRateLimits.key, key));

    return {
      locked: false,
      retryAfterSeconds: 0,
      remainingAttempts: LOGIN_RATE_LIMIT_MAX_ATTEMPTS - 1,
    };
  }

  const newCount = record.attemptCount + 1;
  if (newCount >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    const lockedUntil = new Date(
      now.getTime() + LOGIN_RATE_LIMIT_WINDOW_SECONDS * 1000,
    ).toISOString();

    await db
      .update(loginRateLimits)
      .set({
        attemptCount: newCount,
        lockedUntil,
        updatedAt: nowIso,
      })
      .where(eq(loginRateLimits.key, key));

    return {
      locked: true,
      retryAfterSeconds: LOGIN_RATE_LIMIT_WINDOW_SECONDS,
      remainingAttempts: 0,
    };
  }

  await db
    .update(loginRateLimits)
    .set({
      attemptCount: newCount,
      updatedAt: nowIso,
    })
    .where(eq(loginRateLimits.key, key));

  return {
    locked: false,
    retryAfterSeconds: 0,
    remainingAttempts: LOGIN_RATE_LIMIT_MAX_ATTEMPTS - newCount,
  };
}

/**
 * Resets the rate limit record for a key after successful authentication.
 */
export async function resetRateLimit(db: AppDatabase, key: string): Promise<void> {
  await db.delete(loginRateLimits).where(eq(loginRateLimits.key, key));
}
