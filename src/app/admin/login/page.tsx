import { Suspense } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { getDatabase } from "@/db";
import { getAdminSessionCookieConfig } from "@/lib/auth/session-guard";
import { validateAdminSession } from "@/lib/auth/session-service";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  try {
    const cookieStore = await cookies();
    const cookieConfig = getAdminSessionCookieConfig();
    const sessionToken = cookieStore.get(cookieConfig.name)?.value;

    if (sessionToken) {
      const db = await getDatabase();
      const session = await validateAdminSession(db, sessionToken);
      if (session) {
        redirect("/admin/dashboard");
      }
    }
  } catch (error) {
    // Next.js redirect throws a special NEXT_REDIRECT error which must be rethrown
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Continue rendering login form if session check throws
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF8F3] px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <BrandLogo
            className="h-16 sm:h-20"
            wrapperClassName="rounded-xl px-4 py-2.5 shadow-sm"
            priority
          />
          <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-[#70243B] sm:text-3xl">
            Site Administration
          </h1>
          <p className="mt-1 text-xs font-medium text-[#593E46]">క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ · అధీకృత లాగిన్</p>
        </div>

        <div className="rounded-2xl border border-[#C5A15A]/45 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 border-b border-[#C5A15A]/25 pb-4">
            <h2 className="font-serif text-lg font-semibold text-[#70243B]">
              Sign In to Dashboard
            </h2>
            <p className="mt-0.5 text-xs text-[#593E46]">
              Enter authorized administrator credentials to manage matrimonial content.
            </p>
          </div>

          <Suspense fallback={<div className="h-44 animate-pulse rounded-lg bg-[#FAF8F3]" />}>
            <AdminLoginForm />
          </Suspense>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-[#593E46] transition-colors hover:text-[#70243B]"
          >
            &larr; Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
