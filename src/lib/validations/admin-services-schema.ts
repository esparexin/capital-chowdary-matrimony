import { z } from "zod";

export const ALLOWED_SERVICE_ICONS = [
  "HeartHandshake",
  "ClipboardList",
  "Users",
  "Handshake",
  "Compass",
] as const;

export const createServiceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  titleEn: z.string().trim().min(2, "English title is required"),
  titleTe: z.string().trim().min(2, "Telugu title is required"),
  descriptionEn: z.string().trim().min(5, "English description is required"),
  descriptionTe: z.string().trim().min(5, "Telugu description is required"),
  iconName: z.enum(ALLOWED_SERVICE_ICONS).default("HeartHandshake"),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateServiceSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  titleEn: z.string().trim().min(2, "English title is required").optional(),
  titleTe: z.string().trim().min(2, "Telugu title is required").optional(),
  descriptionEn: z.string().trim().min(5, "English description is required").optional(),
  descriptionTe: z.string().trim().min(5, "Telugu description is required").optional(),
  iconName: z.enum(ALLOWED_SERVICE_ICONS).optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
