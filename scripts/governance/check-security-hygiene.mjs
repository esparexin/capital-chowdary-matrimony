import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const projectRoot = process.cwd();

console.info("[Governance] Auditing security hygiene and secret leak prevention...");

let violations = 0;

// 1. Verify sensitive local files are NOT tracked by Git
const SENSITIVE_LOCAL_FILES = [
  ".env.local",
  ".dev.vars",
  ".env.production",
  ".env.production.local",
  ".env.staging",
];

for (const sensitiveFile of SENSITIVE_LOCAL_FILES) {
  try {
    const tracked = execSync(`git ls-files "${sensitiveFile}"`, {
      encoding: "utf8",
    }).trim();
    if (tracked.length > 0) {
      console.error(
        `  ❌ CRITICAL SECURITY LEAK: "${sensitiveFile}" is tracked in Git! Untrack and remove immediately.`,
      );
      violations++;
    }
  } catch {
    // git command error
  }
}

// 2. Check that .gitignore properly excludes secrets
const gitignorePath = resolve(projectRoot, ".gitignore");
if (!existsSync(gitignorePath)) {
  console.error("  ❌ SECURITY VIOLATION: .gitignore file is missing.");
  violations++;
} else {
  const content = readFileSync(gitignorePath, "utf8");
  const requiredPatterns = [".env", ".dev.vars", "node_modules", ".next", ".open-next"];
  for (const pattern of requiredPatterns) {
    if (!content.includes(pattern)) {
      console.error(`  ❌ GITIGNORE DEFICIENCY: .gitignore must include '${pattern}'.`);
      violations++;
    }
  }
}

// 3. Scan tracked source and documentation for private keys or real tokens
const SCAN_DIRS = ["src", "scripts", "docs"];
const SUSPICIOUS_PATTERNS = [
  /-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PRIVATE)\s+KEY-----/,
  /cloudinary:\/\/(\d+):([a-zA-Z0-9_-]+)@/,
  /ghp_[a-zA-Z0-9]{36}/,
  /github_pat_[a-zA-Z0-9_]{82}/,
];

function scanFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && !entry.name.startsWith(".")) {
        results.push(...scanFiles(full));
      }
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

for (const dir of SCAN_DIRS) {
  const dirPath = resolve(projectRoot, dir);
  if (!existsSync(dirPath)) continue;
  const files = scanFiles(dirPath);

  for (const file of files) {
    const rel = relative(projectRoot, file);
    const content = readFileSync(file, "utf8");
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(content)) {
        console.error(
          `  ❌ SUSPICIOUS PATTERN: ${rel} matches potential secret pattern ${pattern}.`,
        );
        violations++;
      }
    }
  }
}

if (violations > 0) {
  console.error(`[Governance] Security hygiene check failed with ${violations} violation(s).`);
  process.exit(1);
}

console.info("  ✅ Security hygiene verified: No sensitive files or credentials exposed.");
