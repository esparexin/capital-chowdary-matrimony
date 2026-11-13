import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default("Capital Chowdary Matrimony"),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z
    .string()
    .regex(/^\d{8,15}$/, "WhatsApp number must contain 8 to 15 digits")
    .default("919000000000"),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().default(""),
});

const serverEnvSchema = publicEnvSchema.extend({
  AUTH_SESSION_SECRET: z.string().min(32).optional(),
  ADMIN_SESSION_COOKIE_NAME: z.string().min(1).default("ccm_admin_session"),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().min(1).default("capital-chowdary-matrimony"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || undefined,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || undefined,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
  });
}

/**
 * Parses and returns server-only environment configuration.
 * Must never be imported into client components.
 */
export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv() cannot be called in a browser environment.");
  }

  return serverEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || undefined,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || undefined,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
    AUTH_SESSION_SECRET: process.env.AUTH_SESSION_SECRET || undefined,
    ADMIN_SESSION_COOKIE_NAME: process.env.ADMIN_SESSION_COOKIE_NAME || undefined,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || undefined,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || undefined,
    CLOUDINARY_UPLOAD_FOLDER: process.env.CLOUDINARY_UPLOAD_FOLDER || undefined,
  });
}
