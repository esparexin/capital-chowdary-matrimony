import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FormFieldError } from "@/components/forms/FormFieldError";

interface RegistrationTextFieldProps {
  id: string;
  label: string;
  required?: boolean;
  optionalTag?: string;
  helperText?: string;
  errorMessage?: string;
  registration: UseFormRegisterReturn;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

/**
 * Reusable accessible input wrapper with consistent label, helper text, and aria-invalid wiring.
 */
export function RegistrationTextField({
  id,
  label,
  required = false,
  optionalTag,
  helperText,
  errorMessage,
  registration,
  inputProps,
}: RegistrationTextFieldProps) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = errorMessage ? errorId : helperText ? helpId : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}{" "}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
        {optionalTag ? (
          <span className="text-xs font-normal text-muted-foreground">({optionalTag})</span>
        ) : null}
      </label>
      <input
        id={id}
        aria-invalid={errorMessage ? "true" : "false"}
        aria-describedby={describedBy}
        {...inputProps}
        {...registration}
        className="min-h-12 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {helperText ? (
        <p id={helpId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      {errorMessage ? (
        <div id={errorId}>
          <FormFieldError message={errorMessage} />
        </div>
      ) : null}
    </div>
  );
}
