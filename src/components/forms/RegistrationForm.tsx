"use client";

import { useEffect, useState, type BaseSyntheticEvent } from "react";
import { Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { CityAutocompleteField } from "@/components/forms/CityAutocompleteField";
import { FormFieldError } from "@/components/forms/FormFieldError";
import { RegistrationStatusNotice } from "@/components/forms/RegistrationStatusNotice";
import { RegistrationTextField } from "@/components/forms/RegistrationTextField";
import { TermsConsentField } from "@/components/forms/TermsConsentField";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import {
  EMAIL_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  MOBILE_INPUT_MAX_LENGTH,
  PROFILE_TYPES,
  REGISTRATION_DEFAULT_VALUES,
  REGISTRATION_FORM_ID,
  REGISTRATION_SUBMIT_STATE_EVENT,
  registrationFormSchema,
  type RegistrationFormValues,
} from "@/features/registration/registration-schema";
import { createRegistrationSubmitCoordinator } from "@/features/registration/submit-guard";
import { useValidatedForm } from "@/hooks/useValidatedForm";

const SUBMIT_COOLDOWN_MS = 1500;

interface RegistrationFormProps {
  businessWhatsAppNumber: string | null;
}

export function RegistrationForm({ businessWhatsAppNumber }: RegistrationFormProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [preparedUrl, setPreparedUrl] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [submitCoordinator] = useState(() =>
    createRegistrationSubmitCoordinator(SUBMIT_COOLDOWN_MS),
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useValidatedForm<RegistrationFormValues>(registrationFormSchema, {
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: REGISTRATION_DEFAULT_VALUES,
  });

  const updateRedirectingState = (next: boolean) => {
    setIsRedirecting(next);
    window.dispatchEvent(new CustomEvent(REGISTRATION_SUBMIT_STATE_EVENT, { detail: next }));
  };

  useEffect(() => {
    return () => {
      submitCoordinator.release((busy) => {
        window.dispatchEvent(new CustomEvent(REGISTRATION_SUBMIT_STATE_EVENT, { detail: busy }));
      });
    };
  }, [submitCoordinator]);

  const onSubmit = async (values: RegistrationFormValues, event?: BaseSyntheticEvent) => {
    setConfigError(null);

    const formElement = event?.target;
    const rawHoneypot =
      formElement instanceof HTMLFormElement ? new FormData(formElement).get("companyWebsite") : "";
    const honeypotValue = typeof rawHoneypot === "string" ? rawHoneypot : "";

    try {
      const preparation = submitCoordinator.tryPrepare({
        values,
        honeypotValue,
        businessWhatsAppNumber,
        onStateChange: updateRedirectingState,
      });

      if (preparation.status === "missing_config") {
        setConfigError(
          "The official business WhatsApp number is not configured yet. Please check the Contact Us page or try again once the administrator updates Site Settings.",
        );
        return;
      }

      if (preparation.status !== "launched" || !preparation.whatsappUrl) {
        return;
      }

      setPreparedUrl(preparation.whatsappUrl);

      // Yield briefly so the loading indicator paints before launching the external WhatsApp intent
      await new Promise((resolve) => setTimeout(resolve, 150));

      const popup = window.open(preparation.whatsappUrl, "_blank", "noopener,noreferrer");
      if (!popup) {
        window.location.assign(preparation.whatsappUrl);
      }

      submitCoordinator.scheduleUnlock(updateRedirectingState);
    } catch {
      submitCoordinator.release(updateRedirectingState);
    }
  };

  return (
    <form
      id={REGISTRATION_FORM_ID}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="registration-page-heading"
      className="relative space-y-5 rounded-xl border border-border bg-card p-5 shadow-xs sm:p-7 [&_input]:scroll-mb-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
      >
        <label htmlFor="reg-company-website">Website</label>
        <input
          id="reg-company-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <fieldset className="space-y-2.5">
        <legend className="text-sm font-medium text-foreground">
          Profile Type{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {PROFILE_TYPES.map((type) => (
            <label
              key={type}
              className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-secondary/60 focus-within:ring-2 focus-within:ring-ring"
            >
              <input
                type="radio"
                value={type}
                {...register("profileType")}
                className="size-4 accent-primary"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        <FormFieldError message={errors.profileType?.message} />
      </fieldset>

      <RegistrationTextField
        id="reg-full-name"
        label="Full Name"
        required
        errorMessage={errors.fullName?.message}
        registration={register("fullName")}
        inputProps={{
          type: "text",
          autoComplete: "name",
          enterKeyHint: "next",
          maxLength: FULL_NAME_MAX_LENGTH,
        }}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <RegistrationTextField
          id="reg-mobile"
          label="Mobile Number"
          required
          helperText="Enter a 10-digit Indian number (or +country code)."
          errorMessage={errors.mobileNumber?.message}
          registration={register("mobileNumber")}
          inputProps={{
            type: "tel",
            inputMode: "tel",
            autoComplete: "tel",
            enterKeyHint: "next",
            maxLength: MOBILE_INPUT_MAX_LENGTH,
          }}
        />

        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <CityAutocompleteField
              id="reg-city"
              name={field.name}
              label="City"
              required
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              inputRef={field.ref}
              errorMessage={errors.city?.message}
            />
          )}
        />
      </div>

      <RegistrationTextField
        id="reg-email"
        label="Email"
        optionalTag="Optional"
        errorMessage={errors.email?.message}
        registration={register("email")}
        inputProps={{
          type: "email",
          autoComplete: "email",
          autoCapitalize: "none",
          spellCheck: false,
          enterKeyHint: "done",
          maxLength: EMAIL_MAX_LENGTH,
        }}
      />

      <TermsConsentField
        registration={register("acceptedTerms")}
        errorMessage={errors.acceptedTerms?.message}
      />

      <RegistrationStatusNotice configError={configError} preparedUrl={preparedUrl} />

      <div className="hidden pt-1 md:block">
        <button
          type="submit"
          disabled={isRedirecting}
          aria-busy={isRedirecting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#128C7E] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isRedirecting ? (
            <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden="true" />
          ) : (
            <WhatsAppIcon />
          )}
          <span>Send via WhatsApp</span>
        </button>
      </div>
    </form>
  );
}
