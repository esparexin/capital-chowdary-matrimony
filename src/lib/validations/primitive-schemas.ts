import { z } from "zod";

export const localeSchema = z.enum(["en", "te"]);

export const nonEmptyTextSchema = z.string().trim().min(1, "This field is required.");

export const localizedTextSchema = z.object({
  en: nonEmptyTextSchema,
  te: nonEmptyTextSchema,
});

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers, and hyphens.",
  );
