import "server-only";
import type { UploadLimits } from "../../features/quote/photo-rules";

function positiveInteger(
  value: string | undefined,
  fallback: number,
  maximum: number,
) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum)
    throw new Error("Invalid quote upload configuration.");
  return parsed;
}
export function uploadLimits(): UploadLimits {
  return {
    maxFiles: positiveInteger(process.env.QUOTE_MAX_PHOTOS, 5, 8),
    maxFileBytes:
      positiveInteger(process.env.QUOTE_MAX_PHOTO_MB, 5, 8) * 1048576,
  };
}
export const receiptCookie = "lawnflow_quote_receipt";
export const receiptLifetimeSeconds = 24 * 60 * 60;
