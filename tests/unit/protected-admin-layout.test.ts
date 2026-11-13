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
  usePathname: () => "/admin/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

describe("protected admin layout", () => {
  const adminId = "layout-admin-id";
  const adminEmail = "layout@example.com";

  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;
    mockCookieValue = undefined;
    mockRedirect.mockClear();

    const passwordHash = await hashPassword("AdminLayoutPass123!");
    await activeTestDb.insert(adminUsers).values({
      id: adminId,
      email: adminEmail,
      name: "Layout Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    });
  });

  it("redirects unauthenticated users to /admin/login", async () => {
    const { default: ProtectedAdminLayout } = await import("@/app/admin/(protected)/layout");

    await expect(ProtectedAdminLayout({ children: "Protected Content" })).rejects.toThrow(
      "NEXT_REDIRECT",
    );

    expect(mockRedirect).toHaveBeenCalledWith("/admin/login");
  });

  it("renders protected shell and children when valid admin session is present", async () => {
    const session = await createAdminSession(activeTestDb, { adminUserId: adminId });
    mockCookieValue = session.token;

    const { default: ProtectedAdminLayout } = await import("@/app/admin/(protected)/layout");

    const result = await ProtectedAdminLayout({
      children: "Protected Content",
    });

    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
