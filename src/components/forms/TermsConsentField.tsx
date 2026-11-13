import Link from "next/link";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormFieldError } from "@/components/forms/FormFieldError";

interface TermsConsentFieldProps {
  registration: UseFormRegisterReturn;
  errorMessage?: string;
}

/**
 * Mandatory Terms & Conditions consent checkbox linked cleanly to `/terms-and-conditions`.
 */
export function TermsConsentField({ registration, errorMessage }: TermsConsentFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3.5 text-sm text-foreground">
        <input
          id="reg-terms"
          type="checkbox"
          required
          aria-invalid={errorMessage ? "true" : "false"}
          aria-describedby={errorMessage ? "reg-terms-error" : undefined}
          {...registration}
          className="mt-0.5 size-5 shrink-0 accent-primary"
        />
        <span>
          I have read and accept the{" "}
          <Link
            href="/terms-and-conditions"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Terms and Conditions
          </Link>{" "}
          and understand that my inquiry is submitted only when I send the message in WhatsApp.
        </span>
      </label>
      {errorMessage ? (
        <div id="reg-terms-error">
          <FormFieldError message={errorMessage} />
        </div>
      ) : null}
    </div>
  );
}
