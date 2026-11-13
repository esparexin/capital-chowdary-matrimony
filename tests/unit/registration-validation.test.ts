import { afterEach, describe, expect, it, vi } from "vitest";
import { filterIndianCities } from "@/constants/indian-cities";
import {
  MOBILE_INPUT_MAX_LENGTH,
  normalizeMobileNumber,
  normalizeWhitespace,
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/features/registration/registration-schema";
import { createRegistrationSubmitCoordinator } from "@/features/registration/submit-guard";
import {
  buildWhatsAppRegistrationUrl,
  formatRegistrationWhatsAppMessage,
} from "@/features/registration/whatsapp-url";

const VALID_BASE: RegistrationFormValues = {
  profileType: "Groom",
  fullName: "Kalyan Chowdary",
  mobileNumber: "9876543210",
  city: "Narasaraopet",
  email: "kalyan@example.com",
  acceptedTerms: true,
};

afterEach(() => {
  vi.useRealTimers();
});

describe("Registration form Zod validation & normalization", () => {
  it("accepts valid 10-digit Indian mobile numbers and normalizes output", () => {
    for (const number of ["9876543210", "6000000001", "98765 43210", "+91 98765 43210"]) {
      const parsed = registrationFormSchema.safeParse({ ...VALID_BASE, mobileNumber: number });
      expect(parsed.success).toBe(true);
    }

    expect(normalizeMobileNumber("9876543210")).toBe("+91 98765 43210");
    expect(normalizeMobileNumber("+91 9876543210")).toBe("+91 98765 43210");
  });

  it("rejects short, overly long, or non-Indian 11-15 digit numbers without + country code", () => {
    const invalidNumbers = [
      "98765",
      "123456789",
      "5123456789",
      "98765432101",
      "907837839093333333",
      "90783783909333333333",
      "447911123456",
      "98765abcde",
      "98765--43210",
      "   ",
    ];

    expect("90783783909333333333".length).toBeGreaterThan(MOBILE_INPUT_MAX_LENGTH);

    for (const number of invalidNumbers) {
      const parsed = registrationFormSchema.safeParse({ ...VALID_BASE, mobileNumber: number });
      expect(parsed.success).toBe(false);
    }
  });

  it("supports valid + country code E.164 numbers and rejects malformed international values", () => {
    expect(
      registrationFormSchema.safeParse({ ...VALID_BASE, mobileNumber: "+1 415 555 2671" }).success,
    ).toBe(true);
    expect(normalizeMobileNumber("+1 415 555 2671")).toBe("+14155552671");

    for (const badIntl of ["+0123456789", "+123", "+91 5123456789", "+1234567890123456"]) {
      expect(
        registrationFormSchema.safeParse({ ...VALID_BASE, mobileNumber: badIntl }).success,
      ).toBe(false);
    }
  });

  it("accepts legitimate multi-word and Telugu/English city names with whitespace normalization", () => {
    for (const city of ["East Godavari", "New Delhi", "Sri City", "  Narasaraopet   Town  "]) {
      expect(registrationFormSchema.safeParse({ ...VALID_BASE, city }).success).toBe(true);
    }

    expect(normalizeWhitespace("  East   Godavari  ")).toBe("East Godavari");
  });

  it("rejects numeric-only, HTML tags, URLs, domains, and symbol spam in city", () => {
    const badCities = [
      "",
      "A",
      "12345",
      "<script>alert(1)</script>",
      "<b>Guntur</b>",
      "https://spam.example",
      "www.spam.in",
      "promo.com",
      "Guntur!!!",
      "C".repeat(65),
    ];

    for (const city of badCities) {
      expect(registrationFormSchema.safeParse({ ...VALID_BASE, city }).success).toBe(false);
    }
  });

  it("validates required full name, optional email format, and mandatory terms consent", () => {
    expect(registrationFormSchema.safeParse({ ...VALID_BASE, email: "" }).success).toBe(true);
    expect(registrationFormSchema.safeParse({ ...VALID_BASE, email: "bad-email" }).success).toBe(
      false,
    );
    expect(registrationFormSchema.safeParse({ ...VALID_BASE, fullName: "" }).success).toBe(false);
    expect(registrationFormSchema.safeParse({ ...VALID_BASE, fullName: "12345" }).success).toBe(
      false,
    );
    expect(registrationFormSchema.safeParse({ ...VALID_BASE, acceptedTerms: false }).success).toBe(
      false,
    );
  });

  it("filters Indian cities accurately for autocomplete across AP, Telangana, and pan-India", () => {
    const apMatches = filterIndianCities("nara");
    expect(apMatches[0]?.name).toBe("Narasaraopet");

    const telanganaMatches = filterIndianCities("telangana", 5);
    expect(telanganaMatches.some((item) => item.name === "Hyderabad")).toBe(true);
  });

  it("normalizes mobile and city in WhatsApp message and blocks URL generation for invalid input", () => {
    const message = formatRegistrationWhatsAppMessage({
      ...VALID_BASE,
      fullName: "  Kalyan   Chowdary ",
      mobileNumber: "9876543210",
      city: "  East   Godavari ",
    });

    expect(message).toContain("Full Name: Kalyan Chowdary");
    expect(message).toContain("Mobile Number: +91 98765 43210");
    expect(message).toContain("City: East Godavari");

    expect(() =>
      buildWhatsAppRegistrationUrl("917842097842", {
        ...VALID_BASE,
        mobileNumber: "90783783909333333333",
      }),
    ).toThrow("Registration details failed validation.");
  });
});

describe("Registration spam & duplicate-click guard", () => {
  it("prevents invalid forms and filled honeypot fields from launching WhatsApp", () => {
    const coordinator = createRegistrationSubmitCoordinator(1500);
    const states: boolean[] = [];

    const invalidResult = coordinator.tryPrepare({
      values: { ...VALID_BASE, city: "12345" },
      honeypotValue: "",
      businessWhatsAppNumber: "917842097842",
      onStateChange: (busy) => states.push(busy),
    });
    expect(invalidResult.status).toBe("invalid");
    expect(invalidResult.whatsappUrl).toBeUndefined();
    expect(coordinator.isLocked()).toBe(false);

    const botResult = coordinator.tryPrepare({
      values: VALID_BASE,
      honeypotValue: "https://bot-spam.example",
      businessWhatsAppNumber: "917842097842",
      onStateChange: (busy) => states.push(busy),
    });
    expect(botResult.status).toBe("honeypot_blocked");
    expect(botResult.whatsappUrl).toBeUndefined();
    expect(states).toEqual([]);
  });

  it("locks synchronously across rapid duplicate clicks and unlocks after cooldown", () => {
    vi.useFakeTimers();
    const coordinator = createRegistrationSubmitCoordinator(1500);
    const states: boolean[] = [];

    const first = coordinator.tryPrepare({
      values: VALID_BASE,
      honeypotValue: "",
      businessWhatsAppNumber: "917842097842",
      onStateChange: (busy) => states.push(busy),
    });
    expect(first.status).toBe("launched");
    expect(first.whatsappUrl).toContain("https://wa.me/917842097842?text=");
    expect(coordinator.isLocked()).toBe(true);

    const second = coordinator.tryPrepare({
      values: VALID_BASE,
      honeypotValue: "",
      businessWhatsAppNumber: "917842097842",
      onStateChange: (busy) => states.push(busy),
    });
    expect(second.status).toBe("locked");
    expect(second.whatsappUrl).toBeUndefined();

    coordinator.scheduleUnlock((busy) => states.push(busy));
    vi.advanceTimersByTime(1500);

    expect(coordinator.isLocked()).toBe(false);
    expect(states).toEqual([true, false]);
  });
});
