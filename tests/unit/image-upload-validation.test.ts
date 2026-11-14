import { describe, expect, it } from "vitest";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_BYTES,
  MAX_IMAGE_UPLOAD_COUNT,
  formatFileSize,
  isDuplicateFile,
  validateBatchImageFiles,
  validateSingleImageFile,
} from "@/lib/validations/image-upload-schema";

function createMockFile(name: string, sizeBytes: number, type: string, lastModified = 1000): File {
  const buffer = new Uint8Array(sizeBytes);
  return new File([buffer], name, { type, lastModified });
}

describe("Image Upload Validation & Limits SSOT", () => {
  it("enforces strict maximum of 50 images and 5MB per file", () => {
    expect(MAX_IMAGE_UPLOAD_COUNT).toBe(50);
    expect(MAX_IMAGE_FILE_BYTES).toBe(5 * 1024 * 1024);
    expect(ALLOWED_IMAGE_MIME_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
  });

  describe("validateSingleImageFile", () => {
    it("accepts valid JPEG, PNG, and WebP images under 5MB", () => {
      const validJpg = createMockFile("test.jpg", 1024 * 500, "image/jpeg");
      const validPng = createMockFile("test.png", 1024 * 1024 * 2, "image/png");
      const validWebp = createMockFile("test.webp", 1024 * 100, "image/webp");

      expect(validateSingleImageFile(validJpg).valid).toBe(true);
      expect(validateSingleImageFile(validPng).valid).toBe(true);
      expect(validateSingleImageFile(validWebp).valid).toBe(true);
    });

    it("rejects files exceeding 5MB", () => {
      const oversized = createMockFile("large.png", 5 * 1024 * 1024 + 1, "image/png");
      const res = validateSingleImageFile(oversized);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("exceeds the 5MB size limit");
    });

    it("rejects unsupported MIME types and extensions", () => {
      const gif = createMockFile("anim.gif", 1024, "image/gif");
      const pdf = createMockFile("doc.pdf", 1024, "application/pdf");
      const exe = createMockFile("malware.exe", 1024, "application/x-msdownload");

      expect(validateSingleImageFile(gif).valid).toBe(false);
      expect(validateSingleImageFile(pdf).valid).toBe(false);
      expect(validateSingleImageFile(exe).valid).toBe(false);
      expect(validateSingleImageFile(gif).error).toContain("is not a supported format");
    });
  });

  describe("validateBatchImageFiles", () => {
    it("accepts up to exactly 50 images in one upload operation", () => {
      const fiftyFiles = Array.from({ length: 50 }, (_, i) =>
        createMockFile(`photo-${i + 1}.jpg`, 1024 * 100, "image/jpeg", 1000 + i),
      );

      const result = validateBatchImageFiles(fiftyFiles, 0);
      expect(result.accepted).toHaveLength(50);
      expect(result.rejected).toHaveLength(0);
      expect(result.errorSummary).toBeUndefined();
    });

    it("rejects images that exceed the 50-image limit", () => {
      const fiftyFiveFiles = Array.from({ length: 55 }, (_, i) =>
        createMockFile(`photo-${i + 1}.jpg`, 1024 * 100, "image/jpeg", 1000 + i),
      );

      const result = validateBatchImageFiles(fiftyFiveFiles, 0);
      expect(result.accepted).toHaveLength(50);
      expect(result.rejected).toHaveLength(5);
      expect(result.rejected[0]?.reason).toContain("Exceeds the maximum limit of 50 images");
      expect(result.errorSummary).toContain("50 of 55 files accepted. 5 file(s) rejected.");
    });

    it("rejects additional images when current count is already 50", () => {
      const extraFile = [createMockFile("extra.jpg", 1024 * 100, "image/jpeg")];
      const result = validateBatchImageFiles(extraFile, 50);
      expect(result.accepted).toHaveLength(0);
      expect(result.rejected).toHaveLength(1);
      expect(result.errorSummary).toContain("Maximum upload limit of 50 images reached");
    });

    it("filters out oversized files while keeping valid ones in the batch", () => {
      const mixed = [
        createMockFile("good1.jpg", 1024 * 200, "image/jpeg"),
        createMockFile("too-big.jpg", 6 * 1024 * 1024, "image/jpeg"),
        createMockFile("good2.png", 1024 * 300, "image/png"),
      ];

      const result = validateBatchImageFiles(mixed, 0);
      expect(result.accepted).toHaveLength(2);
      expect(result.rejected).toHaveLength(1);
      expect(result.rejected[0]?.file.name).toBe("too-big.jpg");
    });
  });

  describe("duplicate detection & formatting", () => {
    it("detects exact duplicate files by name, size, and timestamp", () => {
      const fileA = createMockFile("sample.jpg", 1000, "image/jpeg", 2000);
      const fileB = createMockFile("sample.jpg", 1000, "image/jpeg", 2000);
      const fileC = createMockFile("sample.jpg", 2000, "image/jpeg", 2000);

      expect(isDuplicateFile(fileB, [fileA])).toBe(true);
      expect(isDuplicateFile(fileC, [fileA])).toBe(false);
    });

    it("formats file sizes cleanly", () => {
      expect(formatFileSize(500)).toBe("500 B");
      expect(formatFileSize(1024 * 512)).toBe("512 KB");
      expect(formatFileSize(1024 * 1024 * 3.5)).toBe("3.5 MB");
    });
  });
});
