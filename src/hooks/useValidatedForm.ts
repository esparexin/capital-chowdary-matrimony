"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

/**
 * Creates a React Hook Form instance pre-configured with Zod schema validation.
 */
export function useValidatedForm<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues, TFieldValues>,
  options?: Omit<UseFormProps<TFieldValues>, "resolver">,
): UseFormReturn<TFieldValues> {
  return useForm<TFieldValues>({
    ...options,
    resolver: zodResolver(schema),
  });
}
