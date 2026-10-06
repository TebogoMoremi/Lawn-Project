import { z } from "zod";
import { propertySchema } from "../validation";

export const centsSchema = z.number().int().min(0).max(999999999999);
export const rangeSchema = z.strictObject({ minimumCents: centsSchema, maximumCents: centsSchema }).refine((range) => range.minimumCents <= range.maximumCents, "Inverted price range");
export const estimatorInputSchema = propertySchema.extend({
  services: z.array(z.strictObject({ slug: z.string().regex(/^[a-z0-9-]+$/).max(100), name: z.string().min(1).max(120), active: z.literal(true) })).min(1).max(8).refine((services) => new Set(services.map((service) => service.slug)).size === services.length),
  photoCount: z.number().int().min(0).max(8),
});
export type EstimatorInput = z.infer<typeof estimatorInputSchema>;
export const factorSchema = z.strictObject({ minimumBps: z.number().int().min(1).max(100000), maximumBps: z.number().int().min(1).max(100000) }).refine((factor) => factor.minimumBps <= factor.maximumBps);
const commonSnapshot = {
  schemaVersion: z.literal(1), pricingVersion: z.string().min(1).max(80), developmentPricing: z.boolean(), currency: z.literal("ZAR"), calculatedAt: z.iso.datetime(),
  inputs: estimatorInputSchema,
  requiresHumanReview: z.boolean(), reviewReasons: z.array(z.string().min(1).max(200)).max(20),
};
export const snapshotSchema = z.discriminatedUnion("status", [
  z.strictObject({ ...commonSnapshot, status: z.literal("estimated"), ...rangeSchema.shape,
    services: z.array(z.strictObject({ slug: z.string(), name: z.string(), base: rangeSchema })).min(1).max(8),
    factors: z.array(z.strictObject({ label: z.string(), ...factorSchema.shape })).length(4),
    minimumVisitCents: centsSchema, minimumApplied: z.boolean(), roundingIncrementCents: centsSchema.refine((value) => value > 0), rounding: z.literal("outward"),
  }).refine((snapshot) => snapshot.minimumCents <= snapshot.maximumCents),
  z.strictObject({ ...commonSnapshot, status: z.literal("review_only"), requiresHumanReview: z.literal(true), minimumCents: z.null(), maximumCents: z.null() }),
]);
export type EstimateSnapshot = z.infer<typeof snapshotSchema>;
export type EstimatedSnapshot = Extract<EstimateSnapshot, { status: "estimated" }>;
export type PriceRange = z.infer<typeof rangeSchema>;

// Stored JSON is untrusted at the presentation boundary. Never recalculate old quotes.
export function readEstimateSnapshot(value: unknown): EstimateSnapshot | null {
  const parsed = snapshotSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
