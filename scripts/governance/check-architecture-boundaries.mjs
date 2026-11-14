import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const projectRoot = process.cwd();
const srcDir = resolve(projectRoot, "src");

const FORBIDDEN_FILENAMES = new Set([
  "data.ts",
  "data.tsx",
  "data.js",
  "common.ts",
  "common.tsx",
  "common.js",
  "helper.ts",
  "helper.tsx",
  "helper.js",
  "utils.ts",
  "utils.tsx",
  "utils.js",
]);

const SERVER_ONLY_MODULE_PATTERNS = [
  /@\/db(\/.*)?$/,
  /@\/lib\/database\/.*/,
  /@\/lib\/auth\/password-hasher/,
  /@\/lib\/cloudinary\/cloudinary-destroy/,
];

function collectFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }
      results.push(...collectFiles(fullPath));
    } else if (entry.isFile()) {
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

const allSrcFiles = collectFiles(srcDir);
let violations = 0;

console.info("[Governance] Checking architectural boundaries & coding standards...");

// 1. Check forbidden generic filenames
for (const filePath of allSrcFiles) {
  const base = basename(filePath);
  if (FORBIDDEN_FILENAMES.has(base)) {
    console.error(
      `  ❌ FORBIDDEN FILENAME: ${relative(projectRoot, filePath)} uses prohibited generic name '${base}'.`,
    );
    violations++;
  }
}

// 2. Check TypeScript strict safety (no @ts- directives, no `any` in src)
for (const filePath of allSrcFiles) {
  const relPath = relative(projectRoot, filePath);
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    // Check suppression directives
    if (/@ts-(ignore|nocheck|expect-error)/.test(line)) {
      console.error(
        `  ❌ TS SUPPRESSION: ${relPath}:${idx + 1} contains TypeScript suppression directive.`,
      );
      violations++;
    }

    // Check `any` type annotations (ignore comments and strings if possible)
    const trimmed = line.trim();
    if (!trimmed.startsWith("//") && !trimmed.startsWith("*")) {
      const anyPattern = /:\s*any\b|<any>|\bas\s+any\b|Promise<any>/;
      if (anyPattern.test(line)) {
        console.error(
          `  ❌ TS ANY DETECTED: ${relPath}:${idx + 1} uses prohibited 'any' type: "${trimmed}"`,
        );
        violations++;
      }
    }
  });
}

// 3. Check client component boundary violations (Runtime imports of server-only modules in "use client")
for (const filePath of allSrcFiles) {
  const relPath = relative(projectRoot, filePath);
  const content = readFileSync(filePath, "utf8");
  const isClient = content.includes('"use client"') || content.includes("'use client'");

  if (!isClient) continue;

  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    // Ignore type-only imports: import type { ... } from "..."
    if (/^\s*import\s+type\s+/.test(line)) {
      return;
    }

    // Match import ... from "..."
    const importMatch = line.match(/from\s+["']([^"']+)["']/);
    if (importMatch) {
      const importPath = importMatch[1];
      for (const pattern of SERVER_ONLY_MODULE_PATTERNS) {
        if (pattern.test(importPath)) {
          console.error(
            `  ❌ BOUNDARY VIOLATION: Client component ${relPath}:${idx + 1} imports server-only module "${importPath}".`,
          );
          violations++;
        }
      }

      if (/getServerEnv/.test(line)) {
        console.error(
          `  ❌ SECRET LEAK RISK: Client component ${relPath}:${idx + 1} imports server environment helper "getServerEnv".`,
        );
        violations++;
      }
    }
  });
}

// 4. Check feature isolation: features shouldn't import from app pages
for (const filePath of allSrcFiles) {
  const relPath = relative(projectRoot, filePath);
  if (relPath.startsWith("src/features/") || relPath.startsWith("src/lib/")) {
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (/from\s+["']@\/app\//.test(line)) {
        console.error(
          `  ❌ LAYER VIOLATION: Lower-tier module ${relPath}:${idx + 1} imports from upper-tier '@/app/': "${line.trim()}".`,
        );
        violations++;
      }
    });
  }
}

if (violations > 0) {
  console.error(`[Governance] Architecture check failed with ${violations} violation(s).`);
  process.exit(1);
}

console.info(
  `[Governance] ✅ Architecture boundaries verified: ${allSrcFiles.length} files comply with modular boundaries and strict TypeScript rules.`,
);
