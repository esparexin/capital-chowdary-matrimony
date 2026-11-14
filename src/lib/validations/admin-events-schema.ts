import { z } from "zod";

export const createMarriageEventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  titleEn: z.string().trim().min(2, "English title is required"),
  titleTe: z.string().trim().min(2, "Telugu title is required"),
  descriptionEn: z.string().trim().default(""),
  descriptionTe: z.string().trim().default(""),
  locationEn: z.string().trim().default(""),
  locationTe: z.string().trim().default(""),
  eventDate: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  // Optional Cloudinary cover media asset
  cloudinaryPublicId: z.string().trim().optional(),
  secureUrl: z.string().trim().url().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
  format: z.string().trim().optional(),
});

export const updateMarriageEventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  titleEn: z.string().trim().min(2, "English title is required").optional(),
  titleTe: z.string().trim().min(2, "Telugu title is required").optional(),
  descriptionEn: z.string().trim().optional(),
  descriptionTe: z.string().trim().optional(),
  locationEn: z.string().trim().optional(),
  locationTe: z.string().trim().optional(),
  eventDate: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
  // Optional Cloudinary cover media replacement
  cloudinaryPublicId: z.string().trim().optional(),
  secureUrl: z.string().trim().url().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
  format: z.string().trim().optional(),
  removeCover: z.boolean().optional(),
});

export type CreateMarriageEventInput = z.infer<typeof createMarriageEventSchema>;
export type UpdateMarriageEventInput = z.infer<typeof updateMarriageEventSchema>;
