import { beforeEach, describe, expect, it } from "vitest";
import type { AppDatabase } from "@/db";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/auth/rate-limiter";
import { createTestDatabase } from "../helpers/test-database";

describe("rate limiter (login_rate_limits)", () => {
  let db: AppDatabase;

  beforeEach(() => {
    const testDb = createTestDatabase();
    db = testDb.db;
  });

  it("permits initial login check when no prior failed attempts exist", async () => {
    const result = await checkRateLimit(db, "login:127.0.0.1:admin@example.com");
    expect(result.allowed).toBe(true);
    expect(result.locked).toBe(false);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("records failed attempts and decrements remaining attempts", async () => {
    const key = "login:127.0.0.1:admin@example.com";
    const res1 = await recordFailedAttempt(db, key);
    expect(res1.locked).toBe(false);
    expect(res1.remainingAttempts).toBe(4);

    const res2 = await recordFailedAttempt(db, key);
    expect(res2.locked).toBe(false);
    expect(res2.remainingAttempts).toBe(3);
  });

  it("locks out user on the 5th failed attempt within the 15-minute window", async () => {
    const key = "login:127.0.0.1:admin@example.com";
    for (let i = 0; i < 4; i++) {
      await recordFailedAttempt(db, key);
    }

    const lockedRes = await recordFailedAttempt(db, key);
    expect(lockedRes.locked).toBe(true);
    expect(lockedRes.remainingAttempts).toBe(0);
    expect(lockedRes.retryAfterSeconds).toBeGreaterThan(0);

    const check = await checkRateLimit(db, key);
    expect(check.allowed).toBe(false);
    expect(check.locked).toBe(true);
    expect(check.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets rate limit upon successful authentication", async () => {
    const key = "login:127.0.0.1:admin@example.com";
    await recordFailedAttempt(db, key);
    await recordFailedAttempt(db, key);

    await resetRateLimit(db, key);

    const check = await checkRateLimit(db, key);
    expect(check.allowed).toBe(true);
    expect(check.locked).toBe(false);
  });

  it("resets attempt counter if the 15-minute window has expired", async () => {
    const key = "login:127.0.0.1:admin@example.com";
    const oldTime = new Date(Date.now() - 16 * 60 * 1000); // 16 minutes ago

    await recordFailedAttempt(db, key, oldTime);
    await recordFailedAttempt(db, key, oldTime);

    const now = new Date();
    const check = await checkRateLimit(db, key, now);
    expect(check.allowed).toBe(true);

    const res = await recordFailedAttempt(db, key, now);
    expect(res.remainingAttempts).toBe(4); // New window started
  });
});
