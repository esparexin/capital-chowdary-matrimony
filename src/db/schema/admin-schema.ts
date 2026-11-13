import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestampColumns } from "./shared-columns";

export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: text("last_login_at"),
  ...timestampColumns,
});

export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    revokedAt: text("revoked_at"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestampColumns,
  },
  (table) => [
    index("idx_admin_sessions_user_id").on(table.adminUserId),
    index("idx_admin_sessions_expires_at").on(table.expiresAt),
  ],
);

export const loginRateLimits = sqliteTable("login_rate_limits", {
  key: text("key").primaryKey(),
  attemptCount: integer("attempt_count").notNull().default(0),
  windowStartedAt: text("window_started_at").notNull(),
  lockedUntil: text("locked_until"),
  ...timestampColumns,
});
