import { QuoteError } from "./errors";

export async function boundedFormData(
  request: Request,
  maxBytes: number,
): Promise<FormData> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.startsWith("multipart/form-data;"))
    throw new QuoteError(415, "Use the quote form to submit your request.");
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maxBytes))
    throw new QuoteError(
      413,
      "The request is too large. Remove some photos and try again.",
    );
  if (!request.body) throw new QuoteError(400, "The request is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(
        new QuoteError(
          408,
          "The upload took too long. Please retry with fewer or smaller photos.",
        ),
      );
      void reader.cancel().catch(() => {});
    }, 30000);
  });
  try {
    for (;;) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new QuoteError(
          413,
          "The request is too large. Remove some photos and try again.",
        );
      }
      chunks.push(value);
    }
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }
  try {
    return await new Response(Buffer.concat(chunks), {
      headers: { "content-type": type },
    }).formData();
  } catch {
    throw new QuoteError(
      400,
      "The upload could not be read. Please select your photos again.",
    );
  }
}
