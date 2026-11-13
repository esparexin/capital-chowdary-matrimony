interface FormFieldErrorProps {
  message?: string;
}

export function FormFieldError({ message }: FormFieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="mt-1 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}
