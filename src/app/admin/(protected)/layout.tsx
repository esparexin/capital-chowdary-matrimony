import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminSectionFrame } from "@/components/admin/AdminSectionFrame";
import { AdminShell } from "@/components/layout/AdminShell";
import { getDatabase } from "@/db";
import { getAdminSessionCookieConfig } from "@/lib/auth/session-guard";
import { validateAdminSession, type AuthenticatedAdminUser } from "@/lib/auth/session-service";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  let user: AuthenticatedAdminUser | null = null;

  try {
    const cookieStore = await cookies();
    const cookieConfig = getAdminSessionCookieConfig();
    const sessionToken = cookieStore.get(cookieConfig.name)?.value;

    if (sessionToken) {
      const db = await getDatabase();
      const sessionResult = await validateAdminSession(db, sessionToken);
      if (sessionResult) {
        user = sessionResult.user;
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
  }

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminShell user={user}>
      <AdminSectionFrame>{children}</AdminSectionFrame>
    </AdminShell>
  );
}
