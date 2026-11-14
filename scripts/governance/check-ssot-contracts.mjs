import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();

console.info("[Governance] Checking Single Source of Truth (SSOT) and contracts...");

let violations = 0;

// 1. Authoritative API Response Contract
const apiResponsePath = resolve(projectRoot, "src/types/api-response.ts");
if (!existsSync(apiResponsePath)) {
  console.error("  ❌ SSOT MISSING: src/types/api-response.ts does not exist.");
  violations++;
} else {
  const content = readFileSync(apiResponsePath, "utf8");
  if (!content.includes("export type ApiResponse") && !content.includes("ApiResponse<")) {
    console.error(
      "  ❌ CONTRACT VIOLATION: src/types/api-response.ts missing ApiResponse definition.",
    );
    violations++;
  }
}

// 2. Authoritative Locale Contract
const localesConstantPath = resolve(projectRoot, "src/constants/locales.ts");
const localeTypesPath = resolve(projectRoot, "src/types/locale-types.ts");
if (!existsSync(localesConstantPath) || !existsSync(localeTypesPath)) {
  console.error("  ❌ SSOT MISSING: Locale constant or type definition is missing.");
  violations++;
} else {
  const content = readFileSync(localesConstantPath, "utf8");
  if (!content.includes('"en"') || !content.includes('"te"')) {
    console.error("  ❌ LOCALE CONTRACT: src/constants/locales.ts must declare 'en' and 'te'.");
    violations++;
  }
}

// 3. Authoritative Navigation Route Verification
const navPath = resolve(projectRoot, "src/constants/navigation.ts");
if (!existsSync(navPath)) {
  console.error("  ❌ SSOT MISSING: src/constants/navigation.ts does not exist.");
  violations++;
} else {
  // Extract all href: "..." from navigation
  const navContent = readFileSync(navPath, "utf8");
  const hrefMatches = navContent.matchAll(/href:\s*["']([^"']+)["']/g);
  for (const match of hrefMatches) {
    const route = match[1];
    // Map route to file path
    // e.g. "/" -> "src/app/(public)/page.tsx"
    // "/about" -> "src/app/(public)/about/page.tsx"
    // "/admin/dashboard" -> "src/app/admin/(protected)/dashboard/page.tsx"
    let expectedPage = "";
    if (route === "/") {
      expectedPage = "src/app/(public)/page.tsx";
    } else if (route.startsWith("/admin/")) {
      const sub = route.replace("/admin/", "");
      expectedPage = `src/app/admin/(protected)/${sub}/page.tsx`;
    } else {
      expectedPage = `src/app/(public)${route}/page.tsx`;
    }

    if (!existsSync(resolve(projectRoot, expectedPage))) {
      console.error(
        `  ❌ DEAD NAV LINK: Navigation route "${route}" does not resolve to an existing page at "${expectedPage}".`,
      );
      violations++;
    }
  }
}

// 4. Database Schema Export Root
const schemaIndexPath = resolve(projectRoot, "src/db/schema/index.ts");
if (!existsSync(schemaIndexPath)) {
  console.error(
    "  ❌ SSOT MISSING: src/db/schema/index.ts must exist as authoritative schema export.",
  );
  violations++;
}

// 5. Database Types Single Source of Truth
const dbTypesPath = resolve(projectRoot, "src/types/database-types.ts");
if (!existsSync(dbTypesPath)) {
  console.error(
    "  ❌ SSOT MISSING: src/types/database-types.ts must exist for inferred D1 entity models.",
  );
  violations++;
}

if (violations > 0) {
  console.error(`[Governance] SSOT & Contract audit failed with ${violations} violation(s).`);
  process.exit(1);
}

console.info(
  "  ✅ SSOT and Shared Contracts successfully verified across navigation, types, and schemas.",
);
