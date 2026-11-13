import { describe, expect, it } from "vitest";
import {
  createSignedSessionToken,
  generateSessionId,
  hashSessionToken,
  verifySignedSessionToken,
} from "@/lib/auth/session-token";

describe("session token engine (HMAC-SHA256)", () => {
  const testSecret = "test-secret-must-be-at-least-32-characters-long";

  it("generates 64-character hex session IDs", () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();

    expect(id1).toMatch(/^[0-9a-f]{64}$/);
    expect(id2).toMatch(/^[0-9a-f]{64}$/);
    expect(id1).not.toBe(id2);
  });

  it("creates a signed token and verifies it successfully", async () => {
    const sessionId = generateSessionId();
    const token = await createSignedSessionToken(sessionId, testSecret);

    expect(token.startsWith(sessionId)).toBe(true);
    expect(token).toContain(".");

    const result = await verifySignedSessionToken(token, testSecret);
    expect(result.valid).toBe(true);
    expect(result.sessionId).toBe(sessionId);
  });

  it("rejects token when sessionId part is tampered", async () => {
    const sessionId = generateSessionId();
    const token = await createSignedSessionToken(sessionId, testSecret);
    const [, sig] = token.split(".");
    const tamperedId = "a".repeat(64);
    const tamperedToken = `${tamperedId}.${sig}`;

    const result = await verifySignedSessionToken(tamperedToken, testSecret);
    expect(result.valid).toBe(false);
  });

  it("rejects token when signature is tampered", async () => {
    const sessionId = generateSessionId();
    const token = await createSignedSessionToken(sessionId, testSecret);
    const [id] = token.split(".");
    const tamperedSig = "b".repeat(64);
    const tamperedToken = `${id}.${tamperedSig}`;

    const result = await verifySignedSessionToken(tamperedToken, testSecret);
    expect(result.valid).toBe(false);
  });

  it("rejects token signed with a different secret", async () => {
    const sessionId = generateSessionId();
    const token = await createSignedSessionToken(sessionId, testSecret);
    const otherSecret = "other-secret-that-is-also-at-least-32-chars-long";

    const result = await verifySignedSessionToken(token, otherSecret);
    expect(result.valid).toBe(false);
  });

  it("rejects malformed tokens", async () => {
    expect((await verifySignedSessionToken("", testSecret)).valid).toBe(false);
    expect((await verifySignedSessionToken("no-dots-here", testSecret)).valid).toBe(false);
    expect((await verifySignedSessionToken("shortId.shortSig", testSecret)).valid).toBe(false);
  });

  it("hashes session token to a deterministic SHA-256 hex string", async () => {
    const sessionId = generateSessionId();
    const hash1 = await hashSessionToken(sessionId);
    const hash2 = await hashSessionToken(sessionId);

    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    expect(hash1).toBe(hash2);
  });
});
