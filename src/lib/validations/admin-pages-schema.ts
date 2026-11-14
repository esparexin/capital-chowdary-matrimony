import { z } from "zod";

export const updatePageSchema = z.object({
  titleEn: z.string().trim().min(2, "English title is required"),
  titleTe: z.string().trim().min(2, "Telugu title is required"),
  summaryEn: z.string().trim().default(""),
  summaryTe: z.string().trim().default(""),
  bodyEn: z.string().trim().default(""),
  bodyTe: z.string().trim().default(""),
  seoTitleEn: z.string().trim().default(""),
  seoTitleTe: z.string().trim().default(""),
  seoDescriptionEn: z.string().trim().default(""),
  seoDescriptionTe: z.string().trim().default(""),
  status: z.enum(["draft", "published"]).optional(),
  verificationStatus: z.enum(["pending_review", "verified"]).optional(),
  verificationNoteEn: z.string().trim().optional(),
  verificationNoteTe: z.string().trim().optional(),
});

export type UpdatePageInput = z.infer<typeof updatePageSchema>;
