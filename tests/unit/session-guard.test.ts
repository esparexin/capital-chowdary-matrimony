import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password-hasher";
import {
  getAdminSessionCookieConfig,
  requireAdminSessionToken,
  requireAuthenticatedAdmin,
} from "@/lib/auth/session-guard";
import { createAdminSession } from "@/lib/auth/session-service";
import { createSignedSessionToken, generateSessionId } from "@/lib/auth/session-token";
import { createTestDatabase } from "../helpers/test-database";

let activeTestDb: AppDatabase;
let mockCookieValue: string | undefined;

vi.mock("@/db", () => ({
  getDatabase: () => Promise.resolve(activeTestDb),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      mockCookieValue && name === getAdminSessionCookieConfig().name
        ? { name, value: mockCookieValue }
        : undefined,
  }),
}));

describe("session guard (requireAdminSessionToken, requireAuthenticatedAdmin)", () => {
  const adminId = "guard-admin-id";
  const adminEmail = "guard@example.com";

  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;
    mockCookieValue = undefined;

    const passwordHash = await hashPassword("GuardAdminPassword123!");
    await activeTestDb.insert(adminUsers).values({
      id: adminId,
      email: adminEmail,
      name: "Guard Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    });
  });

  it("returns default cookie configuration with HttpOnly and Lax settings", () => {
    const config = getAdminSessionCookieConfig();
    expect(config.name).toBe("ccm_admin_session");
    expect(config.httpOnly).toBe(true);
    expect(config.sameSite).toBe("lax");
    expect(config.path).toBe("/");
    expect(config.maxAge).toBe(43200); // 12 hours
  });

  it("throws 401 when session cookie is absent", async () => {
    mockCookieValue = undefined;
    await expect(requireAdminSessionToken()).rejects.toThrow(
      "Administrator authentication is required.",
    );
  });

  it("throws 401 when session cookie has an invalid HMAC signature", async () => {
    mockCookieValue = `${generateSessionId()}.invalid_signature_hex`;
    await expect(requireAdminSessionToken()).rejects.toThrow(
      "Administrator session is invalid or has expired.",
    );
  });

  it("returns session token when cryptographic signature is valid", async () => {
    const sessionId = generateSessionId();
    const token = await createSignedSessionToken(sessionId);
    mockCookieValue = token;

    const returnedToken = await requireAdminSessionToken();
    expect(returnedToken).toBe(token);
  });

  it("authenticates active administrator against D1 database", async () => {
    const session = await createAdminSession(activeTestDb, { adminUserId: adminId });
    mockCookieValue = session.token;

    const user = await requireAuthenticatedAdmin();
    expect(user.id).toBe(adminId);
    expect(user.email).toBe(adminEmail);
    expect(user.name).toBe("Guard Admin");
  });

  it("rejects authentication when session does not exist in D1 database", async () => {
    const orphanSessionId = generateSessionId();
    mockCookieValue = await createSignedSessionToken(orphanSessionId);

    await expect(requireAuthenticatedAdmin()).rejects.toThrow(
      "Administrator session is invalid or has expired.",
    );
  });
});
