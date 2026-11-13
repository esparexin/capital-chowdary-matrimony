import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { contentRevisions, siteSettings } from "@/db/schema";
import { requireAuthenticatedAdmin } from "@/lib/auth/session-guard";
import { applySecurityHeaders } from "@/lib/security/security-headers";
import { AppError, toApiErrorResponse } from "@/lib/utils/error-handler";
import { updateSiteSettingsSchema } from "@/lib/validations/admin-settings-schema";
import type { ApiResponse } from "@/types/api-response";
import type { SiteSettings } from "@/types/database-types";

export async function GET(): Promise<NextResponse<ApiResponse<SiteSettings>>> {
  try {
    await requireAuthenticatedAdmin();
    const db = await getDatabase();

    const [settings] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    if (!settings) {
      throw new AppError("Site settings record not found.", 404, "NOT_FOUND");
    }

    const response = NextResponse.json<ApiResponse<SiteSettings>>({
      ok: true,
      data: settings,
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/settings");
    const response = NextResponse.json<ApiResponse<SiteSettings>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}

export async function PATCH(
  request: Request,
): Promise<NextResponse<ApiResponse<SiteSettings>>> {
  try {
    const admin = await requireAuthenticatedAdmin();
    const rawBody = await request.json();
    const parsed = updateSiteSettingsSchema.parse(rawBody);

    const db = await getDatabase();
    const now = new Date().toISOString();

    const [existing] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    if (!existing) {
      throw new AppError("Site settings record not found.", 404, "NOT_FOUND");
    }

    const updatedValues = {
      businessNameEn: parsed.businessNameEn,
      businessNameTe: parsed.businessNameTe,
      taglineEn: parsed.taglineEn,
      taglineTe: parsed.taglineTe,
      locationEn: parsed.locationEn,
      locationTe: parsed.locationTe,
      addressEn: parsed.addressEn,
      addressTe: parsed.addressTe,
      phoneNumber: parsed.phoneNumber,
      whatsappNumber: parsed.whatsappNumber,
      contactEmail: parsed.contactEmail,
      mapUrl: parsed.mapUrl,
      defaultSeoTitleEn: parsed.defaultSeoTitleEn,
      defaultSeoTitleTe: parsed.defaultSeoTitleTe,
      defaultSeoDescriptionEn: parsed.defaultSeoDescriptionEn,
      defaultSeoDescriptionTe: parsed.defaultSeoDescriptionTe,
      isContactVerified: parsed.isContactVerified,
      updatedAt: now,
    };

    await db
      .update(siteSettings)
      .set(updatedValues)
      .where(eq(siteSettings.id, "default"));

    // Record audit revision
    await db.insert(contentRevisions).values({
      id: crypto.randomUUID(),
      entityType: "site_settings",
      entityId: "default",
      action: "update",
      snapshotJson: JSON.stringify(updatedValues),
      changedByAdminId: admin.id,
      createdAt: now,
    });

    const [saved] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "default"))
      .limit(1);

    const response = NextResponse.json<ApiResponse<SiteSettings>>({
      ok: true,
      data: saved ?? { ...existing, ...updatedValues },
    });
    applySecurityHeaders(response.headers);
    return response;
  } catch (error) {
    const { status, body } = toApiErrorResponse(error, "/api/admin/settings");
    const response = NextResponse.json<ApiResponse<SiteSettings>>(body, { status });
    applySecurityHeaders(response.headers);
    return response;
  }
}
