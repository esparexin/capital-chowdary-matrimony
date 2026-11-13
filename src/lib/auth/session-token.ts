import { AppError } from "@/lib/utils/error-handler";

const DEV_FALLBACK_SECRET = "dev-insecure-auth-session-secret-change-in-production-min32";

export function getAuthSessionSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new AppError(
      "AUTH_SESSION_SECRET environment variable is missing or shorter than 32 characters.",
      500,
      "CONFIG_ERROR",
    );
  }

  return DEV_FALLBACK_SECRET;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    return null;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function generateSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", secretBytes, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/**
 * Creates a signed session token: `<sessionId>.<hmacSha256Hex>`
 */
export async function createSignedSessionToken(
  sessionId: string,
  secret = getAuthSessionSecret(),
): Promise<string> {
  if (!sessionId || !/^[0-9a-fA-F]{64}$/.test(sessionId)) {
    throw new Error("Invalid session ID format.");
  }

  const key = await getHmacKey(secret);
  const data = new TextEncoder().encode(sessionId);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, data);
  const signatureHex = bytesToHex(new Uint8Array(signatureBuffer));

  return `${sessionId}.${signatureHex}`;
}

/**
 * Verifies the HMAC-SHA256 signature of a signed session token.
 */
export async function verifySignedSessionToken(
  token: string,
  secret = getAuthSessionSecret(),
): Promise<{ valid: boolean; sessionId?: string }> {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) {
    return { valid: false };
  }

  const sessionId = token.slice(0, dotIndex);
  const signatureHex = token.slice(dotIndex + 1);

  if (!/^[0-9a-fA-F]{64}$/.test(sessionId)) {
    return { valid: false };
  }

  const signatureBytes = hexToBytes(signatureHex);
  if (!signatureBytes || signatureBytes.length !== 32) {
    return { valid: false };
  }

  const key = await getHmacKey(secret);
  const data = new TextEncoder().encode(sessionId);
  const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes as BufferSource, data);

  if (!isValid) {
    return { valid: false };
  }

  return { valid: true, sessionId };
}

/**
 * Generates the SHA-256 hash of a session ID to store in the database.
 */
export async function hashSessionToken(sessionId: string): Promise<string> {
  const data = new TextEncoder().encode(sessionId);
  const digestBuffer = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digestBuffer));
}
