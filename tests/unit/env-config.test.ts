import { describe, expect, it } from "vitest";
import { getPublicEnv, getServerEnv } from "@/config/env-config";

describe("env-config", () => {
  it("returns safe default public environment values when variables are unset", () => {
    const publicEnv = getPublicEnv();
    expect(publicEnv.NEXT_PUBLIC_SITE_NAME).toBe("Capital Chowdary Matrimony");
    expect(publicEnv.NEXT_PUBLIC_WHATSAPP_NUMBER).toMatch(/^\d{8,15}$/);
  });

  it("returns server environment defaults on the server", () => {
    const serverEnv = getServerEnv();
    expect(serverEnv.ADMIN_SESSION_COOKIE_NAME).toBe("ccm_admin_session");
    expect(serverEnv.CLOUDINARY_UPLOAD_FOLDER).toBe("capital-chowdary-matrimony");
  });
});
