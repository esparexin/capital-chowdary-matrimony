import type { ReactNode } from "react";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { getSiteContactDetails } from "@/features/contact/site-contact";

export default async function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  const contact = await getSiteContactDetails();

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <SiteHeader />
      <main className="flex-1">
        <PublicPageFrame>{children}</PublicPageFrame>
      </main>
      <SiteFooter contact={contact} />
      <MobileStickyCta
        callHref={contact.phoneHref}
        whatsappHref={contact.whatsappHref}
        emailHref={contact.emailHref}
      />
    </div>
  );
}
