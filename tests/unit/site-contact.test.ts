import { describe, expect, it } from "vitest";
import {
  VERIFIED_CONTACT_DEFAULTS,
  VERIFIED_CONTACT_WHATSAPP_URL,
  buildContactWhatsAppUrl,
  buildGoogleMapsEmbedUrl,
  resolveSiteContactDetails,
} from "@/features/contact/site-contact";

describe("shared site contact and Google Maps resolution", () => {
  it("provides the exact verified default contact details for About, Contact, and Footer", () => {
    expect(VERIFIED_CONTACT_DEFAULTS.whatsappDisplay).toBe("+91 78420 97842");
    expect(VERIFIED_CONTACT_DEFAULTS.whatsappHref).toBe(
      "https://api.whatsapp.com/send/?phone=917842097842&text=Namaste%2C+I+want+to+register+in+Capital+Chowdary+Matrimony&type=phone_number&app_absent=0",
    );
    expect(VERIFIED_CONTACT_DEFAULTS.phoneDisplay).toBe("+91 78420 97842");
    expect(VERIFIED_CONTACT_DEFAULTS.phoneHref).toBe("tel:+917842097842");
    expect(VERIFIED_CONTACT_DEFAULTS.paymentDisplay).toBe("+91 95426 86789");
    expect(VERIFIED_CONTACT_DEFAULTS.paymentHref).toBe("tel:+919542686789");
    expect(VERIFIED_CONTACT_DEFAULTS.email).toBe("capitalmatrimony@gmail.com");
    expect(VERIFIED_CONTACT_DEFAULTS.emailHref).toBe("mailto:capitalmatrimony@gmail.com");
    expect(VERIFIED_CONTACT_DEFAULTS.mapsSearchUrl).toBe(
      "https://www.google.com/maps/search/?api=1&query=Ravipadu%20Road%20Narasaraopet%20522601",
    );
    expect(VERIFIED_CONTACT_DEFAULTS.association.registrationNumber).toBe("AP-07 91-058-0756579");
  });

  it("ignores unverified site_settings records and preserves verified defaults", () => {
    const resolved = resolveSiteContactDetails({
      whatsappNumber: "+91 90000 00001",
      phoneNumber: "+91 90000 00002",
      contactEmail: "unverified@example.com",
      isContactVerified: false,
    });

    expect(resolved).toEqual(VERIFIED_CONTACT_DEFAULTS);
  });

  it("applies verified D1 site_settings overrides when verified flag is enabled", () => {
    const resolved = resolveSiteContactDetails({
      businessNameEn: "Capital Chowdary Matrimony",
      businessNameTe: "క్యాపిటల్ చౌదరి మ్యాట్రిమోనీ",
      whatsappNumber: "+91 78420 97842",
      phoneNumber: "+91 78420 97842",
      contactEmail: "capitalmatrimony@gmail.com",
      addressEn:
        "Door No. 11-31-64/1, Ravipadu Road, Opp. Old TVS Showroom, Narasaraopet – 522601, Andhra Pradesh, India.",
      mapUrl:
        "https://www.google.com/maps/search/?api=1&query=Ravipadu%20Road%20Narasaraopet%20522601",
      isContactVerified: true,
    });

    expect(resolved.addressShort).toBe("11-31-64/1, Ravipadu Road, Narasaraopet – 522601");
    expect(resolved.addressAbout).toBe(
      "Door No. 11-31-64/1, Ravipadu Road, Opp. Old TVS Showroom, Narasaraopet – 522601.",
    );
    expect(resolved.whatsappHref).toBe(
      "https://api.whatsapp.com/send/?phone=917842097842&text=Namaste%2C+I+want+to+register+in+Capital+Chowdary+Matrimony&type=phone_number&app_absent=0",
    );
    expect(resolved.phoneHref).toBe("tel:+917842097842");
    expect(resolved.paymentDisplay).toBe("+91 95426 86789");
    expect(resolved.paymentHref).toBe("tel:+919542686789");
  });

  it("builds the exact WhatsApp contact URL with pre-filled message", () => {
    expect(buildContactWhatsAppUrl()).toBe(VERIFIED_CONTACT_WHATSAPP_URL);
    expect(buildContactWhatsAppUrl("+91 78420 97842")).toBe(VERIFIED_CONTACT_WHATSAPP_URL);
  });

  it("builds a keyless privacy-conscious Google Maps embed URL without inventing GPS coordinates", () => {
    expect(
      buildGoogleMapsEmbedUrl(
        "https://www.google.com/maps/search/?api=1&query=Ravipadu%20Road%20Narasaraopet%20522601",
      ),
    ).toBe("https://maps.google.com/maps?q=Ravipadu%20Road%20Narasaraopet%20522601&output=embed");

    expect(buildGoogleMapsEmbedUrl("https://evil.example/maps?q=bad")).toBe(
      "https://maps.google.com/maps?q=Ravipadu%20Road%20Narasaraopet%20522601&output=embed",
    );
  });
});
