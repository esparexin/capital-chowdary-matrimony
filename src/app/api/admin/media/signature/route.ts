import { NextResponse } from "next/server";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import {
  createCloudinaryUploadSignature,
  type CloudinaryMediaCategory,
  type CloudinarySignedUploadParams,
} from "@/lib/cloudinary/cloudinary-signature";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { toApiErrorResponse } from "@/lib/utils/error-handler";
import type { ApiResponse } from "@/types/api-response";

const VALID_CATEGORIES = new Set<CloudinaryMediaCategory>([
  "gallery",
  "events",
  "banners",
  "profiles",
]);

/**
 * Universal media upload signature endpoint for all admin asset uploads.
 * Accepts an optional ?category= query parameter (gallery, events, banners, profiles).
 */
export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<CloudinarySignedUploadParams>>> {
  try {
    await requireAuthenticatedAdmin();

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category");
    const category: CloudinaryMediaCategory =
      categoryParam && VALID_CATEGORIES.has(categoryParam as CloudinaryMediaCategory)
        ? (categoryParam as CloudinaryMediaCategory)
        : "gallery";

    const signatureParams = await createCloudinaryUploadSignature(category);

    const response = NextResponse.json<ApiResponse<CloudinarySignedUploadParams>>({
      ok: true,
      data: signatureParams,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/media/signature");
    const response = NextResponse.json<ApiResponse<CloudinarySignedUploadParams>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
