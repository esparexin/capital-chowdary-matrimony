import { getPublicEnv } from "@/config/env-config";

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "limit" | "scale";
}

/**
 * Builds a delivery URL for a Cloudinary asset public ID.
 */
export function buildCloudinaryImageUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {},
): string {
  const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: cloudName } = getPublicEnv();
  if (!cloudName) {
    throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured.");
  }

  const normalizedPublicId = publicId.replace(/^\/+/, "");
  const transforms: string[] = [];

  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);
  transforms.push(`q_${options.quality ?? "auto"}`);
  transforms.push(`f_${options.format ?? "auto"}`);

  const transformSegment = transforms.join(",");
  return `https://res.cloudinary.com/${encodeURIComponent(cloudName)}/image/upload/${transformSegment}/${normalizedPublicId}`;
}
