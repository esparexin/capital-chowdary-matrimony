import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { adminUsers } from "./admin-schema";
import { timestampColumns } from "./shared-columns";

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  cloudinaryPublicId: text("cloudinary_public_id").notNull().unique(),
  secureUrl: text("secure_url").notNull(),
  resourceType: text("resource_type").notNull().default("image"),
  format: text("format"),
  width: integer("width"),
  height: integer("height"),
  bytes: integer("bytes"),
  altEn: text("alt_en").notNull().default(""),
  altTe: text("alt_te").notNull().default(""),
  uploadedByAdminId: text("uploaded_by_admin_id").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  ...timestampColumns,
});
