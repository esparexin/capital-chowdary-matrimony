import { z } from "zod";

export const heroHighlightSchema = z.object({
  title: z.string().trim().min(1, "Highlight title is required"),
  description: z.string().trim().min(1, "Highlight description is required"),
});

export const updateHomepageHeroSchema = z.object({
  titleEn: z.string().trim().min(2, "English heading is required"),
  titleTe: z.string().trim().min(2, "Telugu intro is required"),
  bodyEn: z.string().trim().min(10, "English description must be at least 10 characters"),
  primaryCtaHref: z.string().trim().min(1).default("/register"),
  primaryCtaLabelEn: z.string().trim().min(1).default("Register"),
  secondaryCtaHref: z.string().trim().min(1).default("/contact"),
  secondaryCtaLabelEn: z.string().trim().min(1).default("Contact Us"),
  associationName: z.string().trim().min(1).default("Kamma Welfare Association"),
  associationDetail: z
    .string()
    .trim()
    .min(1)
    .default("Andhra & Telangana · Regd. No: AP-07 91-058-0756579"),
  highlights: z.array(heroHighlightSchema).default([]),
  status: z.enum(["draft", "published"]).default("published"),
  // Optional Cloudinary media asset
  cloudinaryPublicId: z.string().trim().optional(),
  secureUrl: z.string().trim().url().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
  format: z.string().trim().optional(),
  altEn: z.string().trim().optional(),
});

export type UpdateHomepageHeroInput = z.infer<typeof updateHomepageHeroSchema>;
