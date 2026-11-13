#!/usr/bin/env node

/**
 * Capital Chowdary Matrimony - Admin Provisioning CLI
 *
 * Usage:
 *   ADMIN_EMAIL="admin@capitalchowdarymatrimony.com" \
 *   ADMIN_NAME="Administrator" \
 *   ADMIN_PASSWORD="YourStrongPasswordHere" \
 *   node scripts/provision-admin.mjs [--remote | --local]
 */

import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";

const HASH_SCHEME = "pbkdf2_sha256";
const ITERATIONS = 100_000;
const SALT_BYTE_LENGTH = 16;
const DERIVED_BITS = 256;

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    DERIVED_BITS,
  );

  return `${HASH_SCHEME}$${ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(derivedBits))}`;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";
  const password = process.env.ADMIN_PASSWORD;
  const isRemote = process.argv.includes("--remote");
  const isLocal = process.argv.includes("--local");

  if (!email || !password) {
    console.error("Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
    console.error("\nExample usage:");
    console.error('  ADMIN_EMAIL="admin@capitalchowdarymatrimony.com" \\');
    console.error('  ADMIN_NAME="Administrator" \\');
    console.error('  ADMIN_PASSWORD="StrongSecretPassword123!" \\');
    console.error("  node scripts/provision-admin.mjs [--remote | --local]\n");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Error: ADMIN_PASSWORD must be at least 8 characters long.");
    process.exit(1);
  }

  console.log(`Generating PBKDF2 hash (${ITERATIONS.toLocaleString()} iterations)...`);
  const passwordHash = await hashPassword(password);
  const adminId = randomUUID();
  const now = new Date().toISOString();

  const escapedEmail = email.replace(/'/g, "''");
  const escapedName = name.replace(/'/g, "''");
  const escapedHash = passwordHash.replace(/'/g, "''");

  const sql = `
INSERT INTO admin_users (id, email, name, password_hash, role, is_active, created_at, updated_at)
VALUES ('${adminId}', '${escapedEmail}', '${escapedName}', '${escapedHash}', 'admin', 1, '${now}', '${now}')
ON CONFLICT(email) DO UPDATE SET
  password_hash = excluded.password_hash,
  name = excluded.name,
  is_active = 1,
  updated_at = excluded.updated_at;
`.trim();

  console.log("\n=======================================================");
  console.log(`Administrator: ${name} <${email}>`);
  console.log(`Generated Hash: ${passwordHash.slice(0, 30)}...`);
  console.log("=======================================================\n");

  if (isRemote || isLocal) {
    const targetFlag = isRemote ? "--remote" : "--local";
    console.log(`Executing SQL directly on Cloudflare D1 (${targetFlag})...`);
    execFileSync(
      "npx",
      ["wrangler", "d1", "execute", "capital-chowdary-matrimony", targetFlag, `--command=${sql}`],
      { stdio: "inherit" },
    );
    console.log("\nProvisioning completed successfully!");
  } else {
    console.log("To execute on local D1 database, run:");
    console.log(
      `npx wrangler d1 execute capital-chowdary-matrimony --local --command="${sql.replace(/\n/g, " ")}"`,
    );
    console.log("\nTo execute on remote Cloudflare D1 database, run:");
    console.log(
      `npx wrangler d1 execute capital-chowdary-matrimony --remote --command="${sql.replace(/\n/g, " ")}"`,
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
