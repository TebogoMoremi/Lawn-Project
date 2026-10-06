import "server-only";
import sharp from "sharp";
import { createHash } from "node:crypto";
import {
  photoSelectionError,
  type UploadLimits,
} from "../../features/quote/photo-rules";
import { QuoteError } from "./errors";

export type PreparedPhoto = {
  bytes: Buffer;
  digest: string;
  mimeType: "image/webp";
};
export async function preparePhotos(
  files: File[],
  limits: UploadLimits,
): Promise<PreparedPhoto[]> {
  const error = photoSelectionError(files, limits);
  if (error) throw new QuoteError(400, error);
  const result: PreparedPhoto[] = [];
  for (const file of files) {
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const options = {
        limitInputPixels: 20000000,
        failOn: "warning" as const,
        animated: false,
      };
      const metadata = await sharp(input, options).metadata();
      const actual =
        metadata.format === "jpeg"
          ? "image/jpeg"
          : metadata.format === "png"
            ? "image/png"
            : metadata.format === "webp"
              ? "image/webp"
              : "";
      if (actual !== file.type || (metadata.pages ?? 1) > 1)
        throw new Error("Unsupported image");
      // Fully decode and re-encode, remove metadata/GPS, and bound dimensions.
      const bytes = await sharp(input, options)
        .rotate()
        .resize({
          width: 2560,
          height: 2560,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 82 })
        .toBuffer();
      if (bytes.length > limits.maxFileBytes)
        throw new Error("Image too large");
      result.push({
        bytes,
        mimeType: "image/webp",
        digest: createHash("sha256").update(bytes).digest("hex"),
      });
    } catch {
      throw new QuoteError(
        400,
        "A photo could not be read safely. Use a non-animated JPEG, PNG or WebP under 20 megapixels.",
      );
    }
  }
  return result;
}
