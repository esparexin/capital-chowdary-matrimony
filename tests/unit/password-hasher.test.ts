import { describe, expect, it } from "vitest";
import {
  dummyPasswordVerification,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password-hasher";

describe("password hasher (PBKDF2-SHA256)", () => {
  it("hashes password in the expected pbkdf2_sha256 format with 100k iterations", async () => {
    const hash = await hashPassword("SecretP@ssw0rd123");
    expect(hash).toMatch(/^pbkdf2_sha256\$100000\$[0-9a-f]{32}\$[0-9a-f]{64}$/);
  });

  it("produces unique hashes for identical passwords due to random salt", async () => {
    const hash1 = await hashPassword("samePassword");
    const hash2 = await hashPassword("samePassword");
    expect(hash1).not.toBe(hash2);
  });

  it("verifies correct password against generated hash", async () => {
    const password = "VerySecurePassword!99";
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const hash = await hashPassword("CorrectPassword123");
    const isValid = await verifyPassword("WrongPassword123", hash);
    expect(isValid).toBe(false);
  });

  it("gracefully rejects empty or invalid inputs", async () => {
    expect(await verifyPassword("", "somehash")).toBe(false);
    expect(await verifyPassword("password", "")).toBe(false);
    expect(await verifyPassword("password", "pbkdf2_sha256$invalid")).toBe(false);
    expect(await verifyPassword("password", "bcrypt$2b$10$something")).toBe(false);
    expect(await verifyPassword("password", "pbkdf2_sha256$100000$nothex$nothex")).toBe(false);
  });

  it("runs dummyPasswordVerification without throwing", async () => {
    await expect(dummyPasswordVerification()).resolves.toBeUndefined();
  });
});
