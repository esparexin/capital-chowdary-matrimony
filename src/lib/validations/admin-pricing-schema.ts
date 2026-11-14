import { z } from "zod";

export const createPricingPlanSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  categoryEn: z.string().trim().min(2, "English category name is required"),
  categoryTe: z.string().trim().min(2, "Telugu category name is required"),
  registrationFeeInr: z.number().int().min(0, "Registration fee must be 0 or greater"),
  maleCommissionInr: z.number().int().min(0, "Male commission must be 0 or greater"),
  femaleCommissionInr: z.number().int().min(0, "Female commission must be 0 or greater"),
  validityMonths: z.number().int().min(1, "Validity must be at least 1 month").default(11),
  termsEn: z.string().trim().min(5, "English terms are required"),
  termsTe: z.string().trim().min(5, "Telugu terms are required"),
  verificationStatus: z.enum(["pending_review", "verified"]).default("verified"),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updatePricingPlanSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  categoryEn: z.string().trim().min(2, "English category name is required").optional(),
  categoryTe: z.string().trim().min(2, "Telugu category name is required").optional(),
  registrationFeeInr: z.number().int().min(0, "Registration fee must be 0 or greater").optional(),
  maleCommissionInr: z.number().int().min(0, "Male commission must be 0 or greater").optional(),
  femaleCommissionInr: z.number().int().min(0, "Female commission must be 0 or greater").optional(),
  validityMonths: z.number().int().min(1, "Validity must be at least 1 month").optional(),
  termsEn: z.string().trim().min(5, "English terms are required").optional(),
  termsTe: z.string().trim().min(5, "Telugu terms are required").optional(),
  verificationStatus: z.enum(["pending_review", "verified"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export type CreatePricingPlanInput = z.infer<typeof createPricingPlanSchema>;
export type UpdatePricingPlanInput = z.infer<typeof updatePricingPlanSchema>;
