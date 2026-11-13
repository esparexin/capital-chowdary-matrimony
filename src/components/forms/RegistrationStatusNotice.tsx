import { AlertCircle, CheckCircle2 } from "lucide-react";

interface RegistrationStatusNoticeProps {
  configError: string | null;
  preparedUrl: string | null;
}

/**
 * Accessible status & configuration alert banners for the WhatsApp registration inquiry form.
 */
export function RegistrationStatusNotice({
  configError,
  preparedUrl,
}: RegistrationStatusNoticeProps) {
  return (
    <>
      {configError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{configError}</span>
        </div>
      ) : null}

      {preparedUrl ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/50 p-3.5 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium">
              WhatsApp message prepared. Registration is initiated only after you send the message
              in WhatsApp.
            </p>
            <a
              href={preparedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-medium text-primary underline underline-offset-4"
            >
              Open WhatsApp again if it did not launch automatically
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
