export function isNonEmptyString(value: unknown, maxLength = 500): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export function sanitizeTitle(title: string): string {
  return title.trim().slice(0, 200);
}

export const ALLOWED_UPLOAD_TYPES = ["text/plain", "text/markdown"] as const;
export const ALLOWED_UPLOAD_EXTENSIONS = [".txt", ".md"] as const;
export const MAX_UPLOAD_BYTES = 512 * 1024;

export function isAllowedUpload(filename: string, mimeType: string): boolean {
  const lower = filename.toLowerCase();
  const extOk = ALLOWED_UPLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext));
  const mimeOk =
    ALLOWED_UPLOAD_TYPES.includes(mimeType as (typeof ALLOWED_UPLOAD_TYPES)[number]) ||
    mimeType === "application/octet-stream";
  return extOk && mimeOk;
}
