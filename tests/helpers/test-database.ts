import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/d1";
import type { AppDatabase } from "@/db";
import * as schema from "@/db/schema";

export function createTestDatabase(): { db: AppDatabase; d1: D1Database } {
  const sqlite = new DatabaseSync(":memory:");

  // Execute base migration
  const migrationPath = path.resolve(process.cwd(), "src/db/migrations/0000_rapid_black_queen.sql");
  const migrationSql = fs.readFileSync(migrationPath, "utf-8");
  for (const statement of migrationSql.split("--> statement-breakpoint")) {
    const trimmed = statement.trim();
    if (trimmed) {
      sqlite.exec(trimmed);
    }
  }

  const d1 = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exec(query: string): Promise<any> {
      sqlite.exec(query);
      return Promise.resolve({ count: 1, duration: 0 });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare(query: string): any {
      let boundParams: unknown[] = [];
      return {
        bind(...params: unknown[]) {
          boundParams = params;
          return this;
        },
        async all() {
          const stmt = sqlite.prepare(query);
          stmt.setReturnArrays(false);
          const results = stmt.all(
            ...(boundParams as (string | number | bigint | Buffer | null)[]),
          );
          return { results, success: true, meta: {} };
        },
        async run() {
          const stmt = sqlite.prepare(query);
          const info = stmt.run(...(boundParams as (string | number | bigint | Buffer | null)[]));
          return { results: [], success: true, meta: { changes: info.changes } };
        },
        async first(col?: string) {
          const stmt = sqlite.prepare(query);
          stmt.setReturnArrays(false);
          const row = stmt.get(...(boundParams as (string | number | bigint | Buffer | null)[])) as
            Record<string, unknown> | undefined;
          if (!row) return null;
          return col ? row[col] : row;
        },
        async raw() {
          const stmt = sqlite.prepare(query);
          stmt.setReturnArrays(true);
          const rows = stmt.all(...(boundParams as (string | number | bigint | Buffer | null)[]));
          return rows;
        },
      };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async batch(statements: any[]) {
      const results = [];
      for (const stmt of statements) {
        results.push(await stmt.all());
      }
      return results;
    },
    dump(): Promise<ArrayBuffer> {
      throw new Error("dump not supported in test mock");
    },
  } as unknown as D1Database;

  const db = drizzle(d1, { schema }) as AppDatabase;
  return { db, d1 };
}
