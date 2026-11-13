import { ZodError } from "zod";
import type { ApiErrorResponse } from "@/types/api-response";
import { logEvent } from "@/lib/utils/structured-logger";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function toApiErrorResponse(
  error: unknown,
  route?: string,
): { status: number; body: ApiErrorResponse } {
  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "root";
      const existing = fieldErrors[key] ?? [];
      existing.push(issue.message);
      fieldErrors[key] = existing;
    }

    return {
      status: 400,
      body: {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Input validation failed.",
          fieldErrors,
        },
      },
    };
  }

  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
    };
  }

  logEvent("error", "Unhandled server error", {
    route,
    errorMessage: error instanceof Error ? error.message : "Unknown error",
  });

  return {
    status: 500,
    body: {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    },
  };
}
