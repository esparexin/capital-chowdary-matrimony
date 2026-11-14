import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const projectRoot = process.cwd();

const CHECKS = [
  { name: "Environment Template Verification", script: "scripts/verify-env-example.mjs" },
  {
    name: "File Length Compliance (<= 250 lines)",
    script: "scripts/governance/check-file-lengths.mjs",
  },
  {
    name: "Architecture & Boundary Governance",
    script: "scripts/governance/check-architecture-boundaries.mjs",
  },
  { name: "SSOT & Contract Integrity", script: "scripts/governance/check-ssot-contracts.mjs" },
  { name: "Security & Secret Hygiene", script: "scripts/governance/check-security-hygiene.mjs" },
];

console.info("===============================================================================");
console.info("Capital Chowdary Matrimony — Comprehensive Engineering Governance Gate");
console.info("===============================================================================\n");

let failed = false;

for (const check of CHECKS) {
  console.info(`▶ Running: ${check.name}...`);
  try {
    const fullPath = resolve(projectRoot, check.script);
    execFileSync(process.execPath, [fullPath], { stdio: "inherit" });
    console.info(`✓ Passed: ${check.name}\n`);
  } catch {
    console.error(`\n❌ FAILED: ${check.name}\n`);
    failed = true;
    break;
  }
}

if (failed) {
  console.error("===============================================================================");
  console.error("Engineering Governance gate FAILED. Please resolve the violations above.");
  console.error("===============================================================================");
  process.exit(1);
} else {
  console.info("===============================================================================");
  console.info("All Engineering Governance checks PASSED successfully!");
  console.info("===============================================================================");
}
