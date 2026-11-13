export type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  route?: string;
  [key: string]: unknown;
}

/**
 * Emits structured JSON logs suitable for Cloudflare Workers observability.
 */
export function logEvent(level: LogLevel, message: string, context: LogContext = {}): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}
