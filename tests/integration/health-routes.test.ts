import { describe, expect, it } from "vitest";
import { GET as getPublicHealth } from "@/app/api/public/health/route";

describe("public health route", () => {
  it("returns 200 healthy payload with security headers", async () => {
    const response = await getPublicHealth();
    const json = (await response.json()) as {
      ok: boolean;
      data: { status: string; service: string };
    };

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    expect(json.ok).toBe(true);
    expect(json.data.status).toBe("healthy");
    expect(json.data.service).toBe("capital-chowdary-matrimony");
  });
});
