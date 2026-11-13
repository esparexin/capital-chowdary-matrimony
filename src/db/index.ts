import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { getD1Database } from "@/lib/database/d1-client";

export type AppDatabase = DrizzleD1Database<typeof schema>;

/**
 * Returns a request-scoped Drizzle ORM client connected to the Cloudflare D1 binding.
 */
export async function getDatabase(): Promise<AppDatabase> {
  const d1 = await getD1Database();
  return drizzle(d1, { schema });
}
