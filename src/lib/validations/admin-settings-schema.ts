import { z } from "zod";

export const updateSiteSettingsSchema = z.object({
  businessNameEn: z.string().trim().min(2, "English business name is required"),
  businessNameTe: z.string().trim().min(2, "Telugu business name is required"),
  taglineEn: z.string().trim().min(2, "English tagline is required"),
  taglineTe: z.string().trim().min(2, "Telugu tagline is required"),
  locationEn: z.string().trim().min(2, "English location is required"),
  locationTe: z.string().trim().min(2, "Telugu location is required"),
  addressEn: z.string().trim().default(""),
  addressTe: z.string().trim().default(""),
  phoneNumber: z.string().trim().min(8, "Valid phone number is required"),
  whatsappNumber: z.string().trim().min(8, "Valid WhatsApp number is required"),
  contactEmail: z.string().trim().email("Valid email address is required"),
  mapUrl: z.string().trim().url("Valid map URL is required").or(z.literal("")),
  defaultSeoTitleEn: z.string().trim().min(2, "Default SEO title (English) is required"),
  defaultSeoTitleTe: z.string().trim().min(2, "Default SEO title (Telugu) is required"),
  defaultSeoDescriptionEn: z.string().trim().min(10, "Default SEO description (English) must be at least 10 characters"),
  defaultSeoDescriptionTe: z.string().trim().min(10, "Default SEO description (Telugu) must be at least 10 characters"),
  isContactVerified: z.boolean().default(false),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
