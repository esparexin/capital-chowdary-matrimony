import { getServerEnv } from "@/config/env-config";
import { AppError } from "@/lib/utils/error-handler";

export type CloudinaryMediaCategory = "gallery" | "events" | "banners" | "profiles";

export interface CloudinarySignedUploadParams {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
}

/**
 * Generates a server-side WebCrypto SHA-1 signature for direct signed Cloudinary uploads.
 * Automatically provisions and routes uploads into organized subfolders (gallery, events, banners, profiles).
 */
export async function createCloudinaryUploadSignature(
  categoryOrTimestamp?: CloudinaryMediaCategory | number,
  explicitTimestamp?: number,
): Promise<CloudinarySignedUploadParams> {
  const env = getServerEnv();

  if (
    !env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new AppError("Cloudinary server credentials are not configured.", 500, "CONFIG_ERROR");
  }

  const category: CloudinaryMediaCategory =
    typeof categoryOrTimestamp === "string" ? categoryOrTimestamp : "gallery";
  const timestamp =
    typeof categoryOrTimestamp === "number"
      ? categoryOrTimestamp
      : (explicitTimestamp ?? Math.floor(Date.now() / 1000));

  const baseFolder = env.CLOUDINARY_UPLOAD_FOLDER.replace(/\/+$/, "");
  const folder = `${baseFolder}/${category}`;
  const serializedParams = `folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const encoded = new TextEncoder().encode(serializedParams);
  const digestBuffer = await crypto.subtle.digest("SHA-1", encoded);
  const signature = Array.from(new Uint8Array(digestBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return {
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
    timestamp,
    signature,
  };
}
