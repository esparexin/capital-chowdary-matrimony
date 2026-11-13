import { NextResponse } from "next/server";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import {
  createCloudinaryUploadSignature,
  type CloudinarySignedUploadParams,
} from "@/lib/cloudinary/cloudinary-signature";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { toApiErrorResponse } from "@/lib/utils/error-handler";
import type { ApiResponse } from "@/types/api-response";

export async function POST(): Promise<NextResponse<ApiResponse<CloudinarySignedUploadParams>>> {
  try {
    await requireAuthenticatedAdmin();
    const signatureParams = await createCloudinaryUploadSignature("gallery");

    const response = NextResponse.json<ApiResponse<CloudinarySignedUploadParams>>({
      ok: true,
      data: signatureParams,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/gallery/signature");
    const response = NextResponse.json<ApiResponse<CloudinarySignedUploadParams>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
