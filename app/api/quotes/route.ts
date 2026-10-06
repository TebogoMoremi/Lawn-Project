import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissionSchema, fieldErrors } from "@/features/quote/validation";
import { preparePhotos } from "@/lib/quotes/photos";
import { LocalStorageProvider } from "@/lib/storage/local";
import { createQuoteSubmission } from "@/lib/quotes/service";
import { uploadLimits, receiptCookie } from "@/lib/quotes/config";
import { QuoteError } from "@/lib/quotes/errors";
import { submissionLimiter } from "@/lib/quotes/rate-limit";
import { boundedFormData } from "@/lib/quotes/http";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "private, no-store" };
export async function POST(request: NextRequest) {
  // Same-origin browser submissions only; no trusting forwarded host/IP headers.
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Please submit from the LawnFlow quote form." },
      { status: 403, headers: noStore },
    );
  const release = submissionLimiter.enter();
  if (!release)
    return NextResponse.json(
      {
        error:
          "We’re receiving several requests. Please wait a minute and retry.",
      },
      { status: 429, headers: { ...noStore, "Retry-After": "60" } },
    );
  try {
    if (!process.env.DATABASE_URL)
      throw new QuoteError(
        503,
        "Quote requests are temporarily unavailable. Nothing has been submitted.",
      );
    const limits = uploadLimits();
    const form = await boundedFormData(
      request,
      Math.min(limits.maxFiles * limits.maxFileBytes + 65536, 32 * 1048576),
    );
    if (
      [...form.keys()].some((key) => !["payload", "photos"].includes(key)) ||
      form.getAll("payload").length !== 1
    )
      throw new QuoteError(400, "The request contains unsupported fields.");
    const payload = form.get("payload");
    if (typeof payload !== "string" || Buffer.byteLength(payload) > 16384)
      throw new QuoteError(400, "The form details could not be read.");
    let input: unknown;
    try {
      input = JSON.parse(payload);
    } catch {
      throw new QuoteError(400, "The form details could not be read.");
    }
    const parsed = submissionSchema.safeParse(input);
    if (!parsed.success)
      return NextResponse.json(
        {
          error: "Check your request details.",
          fields: fieldErrors(parsed.error),
        },
        { status: 400, headers: noStore },
      );
    const entries = form.getAll("photos");
    if (entries.some((entry) => typeof entry === "string"))
      throw new QuoteError(400, "Choose image files for photos.");
    const photos = await preparePhotos(entries as File[], limits);
    const receipt = await createQuoteSubmission(parsed.data, photos, {
      db: getDb(),
      storage: new LocalStorageProvider(),
    });
    const response = NextResponse.json(
      { location: "/quote/success" },
      { headers: noStore },
    );
    response.cookies.set(receiptCookie, parsed.data.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: request.nextUrl.protocol === "https:",
      path: "/quote",
      expires: receipt.expiresAt,
    });
    return response;
  } catch (error) {
    if (error instanceof QuoteError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: noStore },
      );
    console.error("quote_submission_failed");
    return NextResponse.json(
      {
        error:
          "We couldn’t confirm your submission. Keep this form open and retry with the same details; retries are protected against duplicate requests.",
      },
      { status: 503, headers: noStore },
    );
  } finally {
    release();
  }
}
