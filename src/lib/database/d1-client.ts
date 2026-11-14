import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";
import { AppError } from "@/lib/utils/error-handler";

/**
 * Resolves the Cloudflare D1 database binding from the active OpenNext worker context.
 */
export async function getD1Database(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const bindings = env as unknown as { DB?: D1Database };

  if (!bindings.DB) {
    throw new AppError("Cloudflare D1 binding 'DB' is unavailable.", 500, "D1_BINDING_MISSING");
  }

  return bindings.DB;
}
