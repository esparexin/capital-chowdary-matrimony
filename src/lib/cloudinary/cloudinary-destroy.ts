import { getServerEnv } from "@/config/env-config";
import { AppError } from "@/lib/utils/error-handler";

export interface CloudinaryDestroyResult {
  result: "ok" | "not found";
}

/**
 * Deletes an image asset from Cloudinary storage using a WebCrypto SHA-1 signed Destroy API call.
 * Fully compatible with Cloudflare Workers, Next.js Edge, and standard Node.js environments.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  timestamp = Math.floor(Date.now() / 1000),
): Promise<CloudinaryDestroyResult> {
  const env = getServerEnv();

  if (
    !env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET
  ) {
    throw new AppError("Cloudinary server credentials are not configured.", 500, "CONFIG_ERROR");
  }

  const normalizedPublicId = publicId.trim();
  if (!normalizedPublicId) {
    throw new AppError("Cloudinary public ID is required for asset deletion.", 400, "BAD_REQUEST");
  }

  const serializedParams = `public_id=${normalizedPublicId}&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
  const encoded = new TextEncoder().encode(serializedParams);
  const digestBuffer = await crypto.subtle.digest("SHA-1", encoded);
  const signature = Array.from(new Uint8Array(digestBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const formData = new FormData();
  formData.append("public_id", normalizedPublicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", env.CLOUDINARY_API_KEY);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as { result?: string; error?: { message: string } };

  if (!response.ok || data.error) {
    throw new AppError(
      data.error?.message || "Failed to delete asset from Cloudinary storage.",
      502,
      "STORAGE_ERROR",
    );
  }

  return { result: data.result === "ok" ? "ok" : "not found" };
}
