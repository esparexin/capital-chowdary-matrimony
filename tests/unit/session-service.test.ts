import { beforeEach, describe, expect, it } from "vitest";
import type { AppDatabase } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password-hasher";
import {
  createAdminSession,
  revokeAdminSession,
  validateAdminSession,
} from "@/lib/auth/session-service";
import { createTestDatabase } from "../helpers/test-database";

describe("session service (admin_sessions)", () => {
  let db: AppDatabase;
  const adminId = "admin-test-uuid";
  const adminEmail = "admin@capitalchowdarymatrimony.com";

  beforeEach(async () => {
    const testDb = createTestDatabase();
    db = testDb.db;

    const passwordHash = await hashPassword("StrongAdminPassword123!");
    await db.insert(adminUsers).values({
      id: adminId,
      email: adminEmail,
      name: "Chowdary Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    });
  });

  it("creates a session and validates it successfully", async () => {
    const session = await createAdminSession(db, {
      adminUserId: adminId,
      ipAddress: "127.0.0.1",
      userAgent: "Vitest/1.0",
    });

    expect(session.token).toBeDefined();
    expect(session.token).toContain(".");

    const result = await validateAdminSession(db, session.token);
    expect(result).not.toBeNull();
    expect(result?.user.id).toBe(adminId);
    expect(result?.user.email).toBe(adminEmail);
    expect(result?.user.name).toBe("Chowdary Admin");
    expect(result?.user.role).toBe("admin");
  });

  it("returns null for tampered session tokens", async () => {
    const session = await createAdminSession(db, { adminUserId: adminId });
    const tampered = session.token.slice(0, -4) + "ffff";

    const result = await validateAdminSession(db, tampered);
    expect(result).toBeNull();
  });

  it("returns null when session has expired", async () => {
    const session = await createAdminSession(db, {
      adminUserId: adminId,
      maxAgeSeconds: 10,
    });

    const futureTime = new Date(Date.now() + 60 * 1000); // 1 minute in future
    const result = await validateAdminSession(db, session.token, futureTime);
    expect(result).toBeNull();
  });

  it("returns null when administrator user is inactive", async () => {
    const inactiveAdminId = "inactive-admin-uuid";
    const passwordHash = await hashPassword("InactiveAdmin123!");
    await db.insert(adminUsers).values({
      id: inactiveAdminId,
      email: "inactive@example.com",
      name: "Inactive Admin",
      passwordHash,
      role: "admin",
      isActive: false,
    });

    const session = await createAdminSession(db, { adminUserId: inactiveAdminId });
    const result = await validateAdminSession(db, session.token);
    expect(result).toBeNull();
  });

  it("revokes session and rejects subsequent validation", async () => {
    const session = await createAdminSession(db, { adminUserId: adminId });
    expect(await validateAdminSession(db, session.token)).not.toBeNull();

    await revokeAdminSession(db, session.token);
    expect(await validateAdminSession(db, session.token)).toBeNull();
  });
});
