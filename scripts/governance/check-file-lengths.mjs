import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const MAX_LINES = 250;
const WARNING_THRESHOLD = 230;
const SCAN_DIRS = ["src"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

const projectRoot = process.cwd();

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
      const ext = entry.name.slice(entry.name.lastIndexOf("."));
      if (EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

let violations = 0;
let warnings = 0;
let totalFilesChecked = 0;

console.info(`[Governance] Auditing source file lengths (Max allowed: ${MAX_LINES} lines)...`);

for (const dirName of SCAN_DIRS) {
  const targetDir = resolve(projectRoot, dirName);
  const files = collectFiles(targetDir);

  for (const filePath of files) {
    totalFilesChecked++;
    const content = readFileSync(filePath, "utf8");
    const lines = content.split("\n").length;
    const relPath = relative(projectRoot, filePath);

    if (lines > MAX_LINES) {
      console.error(`  ❌ VIOLATION: ${relPath} has ${lines} lines (exceeds ${MAX_LINES} limit).`);
      violations++;
    } else if (lines >= WARNING_THRESHOLD) {
      console.warn(
        `  ⚠️  WARNING: ${relPath} has ${lines} lines (approaching ${MAX_LINES} limit).`,
      );
      warnings++;
    }
  }
}

console.info(`[Governance] Completed file length audit: ${totalFilesChecked} files scanned.`);

if (warnings > 0) {
  console.info(
    `  Notice: ${warnings} file(s) are near the threshold (${WARNING_THRESHOLD}+ lines).`,
  );
}

if (violations > 0) {
  console.error(`  Failed: ${violations} file(s) exceed the ${MAX_LINES}-line limit.`);
  process.exit(1);
}

console.info("  ✅ All audited source files comply with the 250-line maximum limit.");
