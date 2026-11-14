import { z } from "zod";

export const createGalleryItemSchema = z.object({
  cloudinaryPublicId: z.string().trim().min(1, "Cloudinary public ID is required."),
  secureUrl: z
    .string()
    .trim()
    .url("Valid secure URL is required.")
    .refine((url) => url.startsWith("https://res.cloudinary.com/"), {
      message: "Image must be served from Cloudinary.",
    }),
  width: z.coerce.number().int().positive().default(800),
  height: z.coerce.number().int().positive().default(600),
  bytes: z.coerce.number().int().positive().optional(),
  format: z.string().trim().max(16).optional(),
  captionEn: z.string().trim().max(500).default(""),
  captionTe: z.string().trim().max(500).default(""),
  status: z.enum(["draft", "published"]).default("published"),
  eventId: z.string().trim().nullable().optional(),
});

export const updateGalleryItemSchema = z.object({
  status: z.enum(["draft", "published"]).optional(),
  captionEn: z.string().trim().max(500).optional(),
  captionTe: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().optional(),
  eventId: z.string().trim().nullable().optional(),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
