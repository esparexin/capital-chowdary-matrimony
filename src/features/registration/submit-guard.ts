import {
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/features/registration/registration-schema";
import { buildWhatsAppRegistrationUrl } from "@/features/registration/whatsapp-url";

export interface PreparedSubmissionResult {
  status: "launched" | "locked" | "honeypot_blocked" | "invalid" | "missing_config";
  whatsappUrl?: string;
}

/**
 * Coordinates synchronous duplicate-submit prevention, honeypot filtering, and
 * single-source-of-truth schema validation prior to launching WhatsApp.
 */
export function createRegistrationSubmitCoordinator(cooldownMs = 1500) {
  let locked = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const isLocked = () => locked;

  const release = (onStateChange?: (busy: boolean) => void) => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    locked = false;
    onStateChange?.(false);
  };

  const tryPrepare = (params: {
    values: RegistrationFormValues;
    honeypotValue: string;
    businessWhatsAppNumber: string | null;
    onStateChange?: (busy: boolean) => void;
  }): PreparedSubmissionResult => {
    if (locked) {
      return { status: "locked" };
    }

    if (params.honeypotValue.trim().length > 0) {
      return { status: "honeypot_blocked" };
    }

    const parsed = registrationFormSchema.safeParse(params.values);
    if (!parsed.success) {
      return { status: "invalid" };
    }

    if (!params.businessWhatsAppNumber) {
      return { status: "missing_config" };
    }

    locked = true;
    params.onStateChange?.(true);

    const whatsappUrl = buildWhatsAppRegistrationUrl(params.businessWhatsAppNumber, parsed.data);
    return { status: "launched", whatsappUrl };
  };

  const scheduleUnlock = (onStateChange?: (busy: boolean) => void) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      release(onStateChange);
    }, cooldownMs);
  };

  return { isLocked, tryPrepare, scheduleUnlock, release };
}
