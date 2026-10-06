import "server-only";
import { createHash } from "node:crypto";
import type { PrismaClient } from "../../generated/prisma/client";
import {
  submissionSchema,
  privacyVersion,
} from "../../features/quote/validation";
import {
  formatQuoteReference,
  referenceYear,
} from "../../features/quote/helpers";
import type { PreparedPhoto } from "./photos";
import type { StorageService } from "../storage/local";
import { QuoteError } from "./errors";
import { receiptLifetimeSeconds } from "./config";
import { estimateForSubmission } from "../../features/quote/estimation/estimator";
import { centsToDecimal } from "../../features/quote/estimation/money";

export function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
type Dependencies = { db: PrismaClient; storage: StorageService; now?: Date };

export async function createQuoteSubmission(
  input: unknown,
  photos: PreparedPhoto[],
  { db, storage, now = new Date() }: Dependencies,
) {
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success)
    throw new QuoteError(
      400,
      "Check the request details and privacy acknowledgement.",
    );
  const { request, token } = parsed.data;
  const tokenHash = hashToken(token);
  const digest = hashToken(
    JSON.stringify({ request, photos: photos.map((photo) => photo.digest) }),
  );
  const expiresAt = new Date(now.getTime() + receiptLifetimeSeconds * 1000);
  const previous = await db.quote.findUnique({
    where: { submissionTokenHash: tokenHash },
    select: { reference: true, submissionDigest: true, receiptExpiresAt: true },
  });
  function replay(quote: NonNullable<typeof previous>) {
    if (quote.submissionDigest !== digest)
      throw new QuoteError(
        409,
        "This submission was already used for different details. Return to your confirmation or start a new request.",
      );
    if (!quote.receiptExpiresAt || quote.receiptExpiresAt <= now)
      throw new QuoteError(
        409,
        "This request was already received, but its private confirmation has expired. Please contact LawnFlow rather than submitting it again.",
      );
    return { reference: quote.reference, expiresAt: quote.receiptExpiresAt };
  }
  if (previous) return replay(previous);

  for (let attempt = 0; attempt < 3; attempt++) {
    // Atomic upsert outside the main transaction: failed attempts leave safe gaps.
    const counter = await db.quoteReferenceCounter.upsert({
      where: { year: referenceYear(now) },
      create: { year: referenceYear(now), lastValue: BigInt(1) },
      update: { lastValue: { increment: 1 } },
    });
    const reference = formatQuoteReference(counter.year, counter.lastValue);
    const written: string[] = [];
    try {
      return await db.$transaction(
        async (tx) => {
          // Serialize retries across processes, not just within one browser/button.
          await tx.$queryRaw`SELECT true AS locked FROM (SELECT pg_advisory_xact_lock(hashtextextended(${tokenHash}, 0))) AS request_lock`;
          const existing = await tx.quote.findUnique({
            where: { submissionTokenHash: tokenHash },
            select: {
              reference: true,
              submissionDigest: true,
              receiptExpiresAt: true,
            },
          });
          if (existing) return replay(existing);
          const services = await tx.service.findMany({
            where: { id: { in: request.serviceIds }, active: true },
            select: { id: true, name: true, slug: true, active: true },
          });
          if (services.length !== request.serviceIds.length)
            throw new QuoteError(
              400,
              "A selected service is no longer available. Refresh the form and choose again.",
            );
          const estimate = estimateForSubmission({
            services: services.map((service) => ({ slug: service.slug, name: service.name, active: true })),
            propertyType: request.propertyType, lawnSizeCategory: request.lawnSizeCategory,
            lawnCondition: request.lawnCondition, frequency: request.frequency, photoCount: photos.length,
          }, now);
          // Anonymous contact details do not prove identity. Never attach a public
          // request to an existing customer solely because email/phone match.
          const customer = await tx.customer.create({
            data: {
              firstName: request.firstName,
              lastName: request.lastName,
              email: request.email,
              phone: request.phone,
            },
          });
          const address = await tx.address.create({
            data: {
              customerId: customer.id,
              addressLine1: request.addressLine1,
              addressLine2: request.addressLine2 || null,
              suburb: request.suburb,
              city: request.city,
              province: request.province,
              postalCode: request.postalCode,
            },
          });
          try {
            for (const photo of photos)
              written.push(await storage.put(photo.bytes));
          } catch {
            throw new QuoteError(
              503,
              "Your photos could not be stored. Please retry shortly.",
            );
          }
          await tx.quote.create({
            data: {
              reference,
              customerId: customer.id,
              addressId: address.id,
              propertyType: request.propertyType,
              lawnSizeCategory: request.lawnSizeCategory,
              lawnCondition: request.lawnCondition,
              frequency:
                request.frequency === "UNKNOWN" ? null : request.frequency,
              status: "QUOTE_REQUESTED",
              estimatedMin: estimate.status === "estimated" ? centsToDecimal(estimate.minimumCents) : null,
              estimatedMax: estimate.status === "estimated" ? centsToDecimal(estimate.maximumCents) : null,
              finalPrice: null,
              estimateSnapshot: estimate,
              customerNotes: request.notes || null,
              submissionTokenHash: tokenHash,
              submissionDigest: digest,
              receiptExpiresAt: expiresAt,
              privacyAcknowledgedAt: now,
              privacyVersion,
              items: {
                create: services.map((service) => ({
                  serviceId: service.id,
                  serviceName: service.name,
                  quantity: 1,
                })),
              },
              photos: {
                create: written.map((storageKey, index) => ({
                  storageKey,
                  mimeType: photos[index].mimeType,
                  fileSize: photos[index].bytes.length,
                  altText: `Customer-provided garden photo ${index + 1}`,
                })),
              },
              statusHistory: {
                create: {
                  status: "QUOTE_REQUESTED",
                  note: "Customer submitted a quote request.",
                },
              },
            },
          });
          return { reference, expiresAt };
        },
        { maxWait: 10000, timeout: 30000, isolationLevel: "ReadCommitted" },
      );
    } catch (error) {
      // Known transaction rejections rolled back. Unknown connection/commit
      // errors are ambiguous: retain files for reconciliation, not data loss.
      const code =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "";
      const safeToClean =
        error instanceof QuoteError ||
        ["P2002", "P2003", "P2025", "P2034"].includes(code);
      if (safeToClean)
        await Promise.all(
          written.map((key) =>
            storage
              .remove(key)
              .catch(() => console.error("quote_upload_cleanup_failed")),
          ),
        );
      if (code === "P2002") continue;
      throw error;
    }
  }
  throw new QuoteError(
    503,
    "We could not allocate your request reference. Please retry shortly using this form.",
  );
}
