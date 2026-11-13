import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password-hasher";
import { getAdminSessionCookieConfig } from "@/lib/auth/session-guard";
import { createAdminSession } from "@/lib/auth/session-service";
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

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mockRedirect(url);
    throw new Error("NEXT_REDIRECT");
  },
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("admin login page", () => {
  const adminId = "login-page-admin-id";
  const adminEmail = "loginpage@example.com";

  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;
    mockCookieValue = undefined;
    mockRedirect.mockClear();

    const passwordHash = await hashPassword("LoginPagePass123!");
    await activeTestDb.insert(adminUsers).values({
      id: adminId,
      email: adminEmail,
      name: "Login Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    });
  });

  it("renders sign-in page when user is not logged in", async () => {
    const { default: AdminLoginPage } = await import("@/app/admin/login/page");
    const result = await AdminLoginPage();
    expect(result).toBeDefined();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to /admin/dashboard when user already has an active session", async () => {
    const session = await createAdminSession(activeTestDb, { adminUserId: adminId });
    mockCookieValue = session.token;

    const { default: AdminLoginPage } = await import("@/app/admin/login/page");
    await expect(AdminLoginPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/admin/dashboard");
  });
});
