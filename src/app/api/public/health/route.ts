import { NextResponse } from "next/server";
import { CLOUDFLARE_CONFIG } from "@/config/cloudflare-config";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import type { ApiResponse } from "@/types/api-response";

interface PublicHealthPayload {
  status: "healthy";
  service: string;
  timestamp: string;
}

export async function GET(): Promise<NextResponse<ApiResponse<PublicHealthPayload>>> {
  const response = NextResponse.json<ApiResponse<PublicHealthPayload>>({
    ok: true,
    data: {
      status: "healthy",
      service: CLOUDFLARE_CONFIG.workerName,
      timestamp: new Date().toISOString(),
    },
  });

  applySecurityHeaders(response.headers);
  return response;
}
