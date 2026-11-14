import { z } from "zod";

export const MAX_IMAGE_UPLOAD_COUNT = 50;
export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface BatchValidationResult {
  accepted: File[];
  rejected: Array<{ file: File; reason: string }>;
  errorSummary?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isValidImageFileType(file: File): boolean {
  if (ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
    return true;
  }
  const lowerName = file.name.toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function validateSingleImageFile(file: File): FileValidationResult {
  if (!isValidImageFileType(file)) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported format. Please select JPEG, PNG, or WebP.`,
    };
  }
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" (${formatFileSize(file.size)}) exceeds the 5MB size limit.`,
    };
  }
  return { valid: true };
}

export function isDuplicateFile(candidate: File, existingFiles: File[]): boolean {
  return existingFiles.some(
    (existing) =>
      existing.name === candidate.name &&
      existing.size === candidate.size &&
      existing.lastModified === candidate.lastModified,
  );
}

export function validateBatchImageFiles(
  incomingFiles: File[],
  currentCount: number,
  maxAllowed = MAX_IMAGE_UPLOAD_COUNT,
): BatchValidationResult {
  const accepted: File[] = [];
  const rejected: Array<{ file: File; reason: string }> = [];

  const availableSlots = Math.max(0, maxAllowed - currentCount);

  if (availableSlots === 0) {
    return {
      accepted: [],
      rejected: incomingFiles.map((f) => ({
        file: f,
        reason: `Maximum upload limit of ${maxAllowed} images reached.`,
      })),
      errorSummary: `Maximum upload limit of ${maxAllowed} images reached. Cannot add more files.`,
    };
  }

  for (const file of incomingFiles) {
    if (accepted.length >= availableSlots) {
      rejected.push({
        file,
        reason: `Exceeds the maximum limit of ${maxAllowed} images per upload operation.`,
      });
      continue;
    }

    const singleCheck = validateSingleImageFile(file);
    if (!singleCheck.valid) {
      rejected.push({ file, reason: singleCheck.error || "Invalid file" });
      continue;
    }

    accepted.push(file);
  }

  let errorSummary: string | undefined;
  if (rejected.length > 0) {
    if (accepted.length === 0) {
      errorSummary = `None of the ${incomingFiles.length} selected files were accepted.`;
    } else {
      errorSummary = `${accepted.length} of ${incomingFiles.length} files accepted. ${rejected.length} file(s) rejected.`;
    }
  }

  return { accepted, rejected, errorSummary };
}

export const imageUploadConstraintsSchema = z.object({
  maxCount: z.literal(MAX_IMAGE_UPLOAD_COUNT),
  maxBytes: z.literal(MAX_IMAGE_FILE_BYTES),
  allowedTypes: z.array(z.string()),
});
