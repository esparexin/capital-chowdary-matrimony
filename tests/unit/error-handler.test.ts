import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";

describe("error-handler", () => {
  it("maps Zod validation errors to HTTP 400 with fieldErrors", () => {
    const schema = z.object({ title: z.string().min(3) });
    const parsed = schema.safeParse({ title: "a" });
    expect(parsed.success).toBe(false);

    if (!parsed.success) {
      const response = toApiErrorResponse(parsed.error, "/api/test");
      expect(response.status).toBe(400);
      expect(response.body.ok).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
      expect(response.body.error.fieldErrors?.title).toBeDefined();
    }
  });

  it("maps AppError instances cleanly", () => {
    const response = toApiErrorResponse(new AppError("Denied", 403, "FORBIDDEN"));
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      ok: false,
      error: {
        code: "FORBIDDEN",
        message: "Denied",
      },
    });
  });
});
