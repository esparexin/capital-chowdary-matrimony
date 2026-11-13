import { PASSWORD_PBKDF2_ITERATIONS } from "@/constants/security-constants";

const HASH_ALGORITHM = "SHA-256";
const DERIVED_KEY_BITS = 256;
const SALT_BYTE_LENGTH = 16;
const HASH_SCHEME = "pbkdf2_sha256";

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

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    const byteA = a[i] ?? 0;
    const byteB = b[i] ?? 0;
    diff |= byteA ^ byteB;
  }
  return diff === 0;
}

async function derivePbkdf2Bytes(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const passwordBuffer = new TextEncoder().encode(password);
  const baseKey = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, [
    "deriveBits",
  ]);

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations,
      hash: HASH_ALGORITHM,
    },
    baseKey,
    DERIVED_KEY_BITS,
  );

  return new Uint8Array(derivedBits);
}

/**
 * Hashes a plaintext password using Web Crypto PBKDF2 (SHA-256, 100k iterations, 16-byte random salt).
 * Output format: pbkdf2_sha256$<iterations>$<saltHex>$<hashHex>
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string.");
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const derived = await derivePbkdf2Bytes(password, salt, PASSWORD_PBKDF2_ITERATIONS);

  return `${HASH_SCHEME}$${PASSWORD_PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(derived)}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash using timing-safe comparison.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash || typeof password !== "string" || typeof storedHash !== "string") {
    return false;
  }

  const parts = storedHash.split("$");
  if (parts.length !== 4) return false;

  const [scheme, iterationsStr, saltHex, hashHex] = parts;
  if (!scheme || !iterationsStr || !saltHex || !hashHex) return false;
  if (scheme !== HASH_SCHEME) return false;

  const iterations = Number.parseInt(iterationsStr, 10);
  if (Number.isNaN(iterations) || iterations < 10_000 || iterations > 500_000) {
    return false;
  }

  const salt = hexToBytes(saltHex);
  const expectedHash = hexToBytes(hashHex);
  if (!salt || !expectedHash || salt.length < 16 || expectedHash.length !== 32) {
    return false;
  }

  const derived = await derivePbkdf2Bytes(password, salt, iterations);
  return timingSafeEqual(derived, expectedHash);
}

/**
 * Runs a dummy PBKDF2 derivation to equalize response timing when a non-existent user is queried.
 */
export async function dummyPasswordVerification(): Promise<void> {
  const dummySalt = new Uint8Array(SALT_BYTE_LENGTH);
  await derivePbkdf2Bytes("dummy-password-check", dummySalt, PASSWORD_PBKDF2_ITERATIONS);
}
