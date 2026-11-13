export const DEFAULT_SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
] as const;

export function applySecurityHeaders(headers: Headers): Headers {
  for (const [key, value] of DEFAULT_SECURITY_HEADERS) {
    headers.set(key, value);
  }
  return headers;
}
