import type { Metadata } from "next";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { MotionContainer } from "@/components/shared/MotionContainer";
import { getSiteContactDetails } from "@/features/contact/site-contact";
import { resolveConfiguredWhatsAppNumber } from "@/features/registration/whatsapp-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bride & Groom Registration",
  description:
    "Initiate a matrimonial registration inquiry with Capital Chowdary Matrimony via WhatsApp.",
};

export default async function RegisterPage() {
  const contact = await getSiteContactDetails();
  const businessWhatsAppNumber = resolveConfiguredWhatsAppNumber(
    contact.whatsappDisplay,
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );

  return (
    <MotionContainer className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-1.5">
        <p className="whitespace-nowrap text-[clamp(0.5625rem,0.18rem+2.0vw,0.75rem)] font-semibold uppercase tracking-[0.03em] text-primary sm:text-xs sm:tracking-widest">
          Capital Chowdary Matrimony &middot; Narasaraopet
        </p>
        <h1
          id="registration-page-heading"
          className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Bride &amp; Groom Registration
        </h1>
      </div>

      <RegistrationForm businessWhatsAppNumber={businessWhatsAppNumber} />
    </MotionContainer>
  );
}
