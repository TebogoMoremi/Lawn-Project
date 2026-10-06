import "server-only";
import { z } from "zod";
import { propertySchema } from "../validation";
import { centsSchema, rangeSchema, factorSchema } from "./types";

export const pricingConfigSchema = z.strictObject({
  version: z.string().min(1).max(80), developmentPricing: z.boolean(), currency: z.literal("ZAR"),
  services: z.record(z.string().regex(/^[a-z0-9-]+$/), z.strictObject({ base: rangeSchema, requiresReview: z.boolean() })),
  size: z.record(propertySchema.shape.lawnSizeCategory, factorSchema),
  condition: z.record(propertySchema.shape.lawnCondition, factorSchema),
  property: z.record(propertySchema.shape.propertyType, factorSchema),
  frequency: z.record(propertySchema.shape.frequency, factorSchema),
  minimumVisitCents: centsSchema, roundingIncrementCents: z.number().int().min(1).max(100000), highEstimateCents: centsSchema,
  review: z.strictObject({ sizes: z.array(propertySchema.shape.lawnSizeCategory), conditions: z.array(propertySchema.shape.lawnCondition), properties: z.array(propertySchema.shape.propertyType), frequencies: z.array(propertySchema.shape.frequency), serviceCount: z.number().int().min(1).max(8), combinations: z.array(z.array(z.string()).min(2)), }),
});
export type PricingConfig = z.infer<typeof pricingConfigSchema>;
const factor = (minimumBps: number, maximumBps = minimumBps) => ({ minimumBps, maximumBps });
const service = (minimumCents: number, maximumCents: number, requiresReview = false) => ({ base: { minimumCents, maximumCents }, requiresReview });

// Demonstration assumptions only: NOT verified LawnFlow commercial prices.
// A future repository/admin service can supply this same validated config shape.
export const developmentPricing: PricingConfig = {
  version: "2026-10-demo-v1", developmentPricing: true, currency: "ZAR",
  services: {
    "grass-cutting": service(25000, 35000), "lawn-edging": service(10000, 18000),
    "garden-cleanup": service(30000, 60000), "hedge-trimming": service(20000, 45000),
    "weed-removal": service(15000, 30000), "yard-cleanup": service(30000, 65000),
    "recurring-lawn-maintenance": service(25000, 45000), "commercial-lawn-maintenance": service(60000, 120000, true),
  },
  size: { SMALL: factor(10000), MEDIUM: factor(12500), LARGE: factor(16000), UNKNOWN: factor(13000) },
  condition: { MAINTAINED: factor(10000), OVERGROWN: factor(12500), HEAVILY_OVERGROWN: factor(15000), UNKNOWN: factor(12000) },
  property: { RESIDENTIAL: factor(10000), COMMERCIAL: factor(15000, 18000), SHARED_PROPERTY: factor(12000, 14000), OTHER: factor(11500, 13000) },
  frequency: { ONCE_OFF: factor(10000), WEEKLY: factor(8500), FORTNIGHTLY: factor(9000), MONTHLY: factor(9500), UNKNOWN: factor(10000) },
  minimumVisitCents: 25000, roundingIncrementCents: 1000, highEstimateCents: 500000,
  review: { sizes: ["UNKNOWN"], conditions: ["UNKNOWN", "HEAVILY_OVERGROWN"], properties: ["COMMERCIAL", "SHARED_PROPERTY", "OTHER"], frequencies: ["UNKNOWN"], serviceCount: 4,
    combinations: [["grass-cutting", "recurring-lawn-maintenance"], ["garden-cleanup", "yard-cleanup"], ["commercial-lawn-maintenance", "recurring-lawn-maintenance"]] },
};
