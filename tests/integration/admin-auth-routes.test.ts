import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppDatabase } from "@/db";
import { adminUsers } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password-hasher";
import { createSignedSessionToken, generateSessionId } from "@/lib/auth/session-token";
import { createTestDatabase } from "../helpers/test-database";

let activeTestDb: AppDatabase;

vi.mock("@/db", () => ({
  getDatabase: () => Promise.resolve(activeTestDb),
}));

describe("admin authentication API routes (/api/admin/login, /api/admin/logout)", () => {
  const adminId = "admin-integration-id";
  const adminEmail = "admin@capitalchowdarymatrimony.com";
  const rawPassword = "CorrectPassword123!";

  beforeEach(async () => {
    const testDb = createTestDatabase();
    activeTestDb = testDb.db;

    const passwordHash = await hashPassword(rawPassword);
    await activeTestDb.insert(adminUsers).values({
      id: adminId,
      email: adminEmail,
      name: "Admin Tester",
      passwordHash,
      role: "admin",
      isActive: true,
    });
  });

  it("rejects login request from a foreign origin (CSRF protection)", async () => {
    const { POST: loginHandler } = await import("@/app/api/admin/login/route");
    const request = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://evil-attacker-site.com",
      },
      body: JSON.stringify({ email: adminEmail, password: rawPassword }),
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(403);
    const json = (await response.json()) as { ok: boolean; error: { code: string } };
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("FORBIDDEN");
  });

  it("returns 400 for invalid email format or short password", async () => {
    const { POST: loginHandler } = await import("@/app/api/admin/login/route");
    const request = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email: "invalid-email", password: "123" }),
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(400);
    const json = (await response.json()) as { ok: boolean; error: { code: string } };
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 401 for unknown administrator email", async () => {
    const { POST: loginHandler } = await import("@/app/api/admin/login/route");
    const request = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email: "unknown@example.com", password: rawPassword }),
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(401);
    const json = (await response.json()) as { ok: boolean; error: { code: string } };
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for wrong password", async () => {
    const { POST: loginHandler } = await import("@/app/api/admin/login/route");
    const request = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email: adminEmail, password: "WrongPassword123!" }),
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(401);
    const json = (await response.json()) as { ok: boolean; error: { code: string } };
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("locks out user and returns 429 after 5 failed attempts", async () => {
    const { POST: loginHandler } = await import("@/app/api/admin/login/route");
    for (let i = 0; i < 5; i++) {
      const req = new Request("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000",
          "cf-connecting-ip": "198.51.100.1",
        },
        body: JSON.stringify({ email: adminEmail, password: "WrongPassword!" }),
      });
      await loginHandler(req);
    }

    // 6th attempt should return 429
    const lockReq = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
        "cf-connecting-ip": "198.51.100.1",
      },
      body: JSON.stringify({ email: adminEmail, password: rawPassword }),
    });
    const res = await loginHandler(lockReq);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeDefined();
  });

  it("successfully logs in with valid credentials, setting HTTP-only session cookie", async () => {
    const { POST: loginHandler } = await import("@/app/api/admin/login/route");
    const request = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
        "cf-connecting-ip": "203.0.113.195",
        "user-agent": "Mozilla/5.0 Test",
      },
      body: JSON.stringify({ email: adminEmail, password: rawPassword }),
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      ok: boolean;
      data: { user: { email: string; name: string } };
    };
    expect(json.ok).toBe(true);
    expect(json.data.user.email).toBe(adminEmail);
    expect(json.data.user.name).toBe("Admin Tester");

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("ccm_admin_session=");
    expect(setCookie?.toLowerCase()).toContain("httponly");
    expect(setCookie?.toLowerCase()).toContain("samesite=lax");
  });

  it("logs out and clears the session cookie", async () => {
    const { POST: logoutHandler } = await import("@/app/api/admin/logout/route");
    const sessionId = generateSessionId();
    const token = await createSignedSessionToken(sessionId);

    const request = new Request("http://localhost:3000/api/admin/logout", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        cookie: `ccm_admin_session=${token}`,
      },
    });

    const response = await logoutHandler(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as { ok: boolean; data: { loggedOut: boolean } };
    expect(json.ok).toBe(true);
    expect(json.data.loggedOut).toBe(true);

    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("Max-Age=0");
  });
});
