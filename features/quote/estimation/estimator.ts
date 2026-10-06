import "server-only";
import { propertyTypes, lawnSizes, lawnConditions, frequencies } from "../validation";
import { estimatorInputSchema, snapshotSchema, type EstimatorInput, type EstimateSnapshot, type EstimatedSnapshot } from "./types";
import { pricingConfigSchema, developmentPricing, type PricingConfig } from "./pricing-config";

function reviewOnly(input: EstimatorInput, version: string, date: Date, development: boolean, reason: string): EstimateSnapshot {
  return { schemaVersion: 1, pricingVersion: version, developmentPricing: development, currency: "ZAR", calculatedAt: date.toISOString(), inputs: input, status: "review_only", minimumCents: null, maximumCents: null, requiresHumanReview: true, reviewReasons: [reason] };
}

// No I/O, clock reads or UI dependencies: same inputs/config/time => same snapshot.
export function estimateQuote(rawInput: EstimatorInput, rawConfig: PricingConfig, calculatedAt: Date): EstimateSnapshot {
  const input = estimatorInputSchema.parse(rawInput);
  const config = pricingConfigSchema.parse(rawConfig);
  const services = [...input.services].sort((a, b) => a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0);
  input.services = services;
  if (services.some((service) => !Object.hasOwn(config.services, service.slug))) return reviewOnly(input, config.version, calculatedAt, config.developmentPricing, "A selected service needs individual pricing review.");
  const lines = services.map((service) => ({ slug: service.slug, name: service.name, base: config.services[service.slug].base }));
  const factors = [
    { label: `${lawnSizes[input.lawnSizeCategory]} lawn size`, ...config.size[input.lawnSizeCategory] },
    { label: `${lawnConditions[input.lawnCondition]} lawn condition`, ...config.condition[input.lawnCondition] },
    { label: `${propertyTypes[input.propertyType]} property`, ...config.property[input.propertyType] },
    { label: `${frequencies[input.frequency]} frequency (per visit)`, ...config.frequency[input.frequency] },
  ];
  const reasons: string[] = [];
  if (config.review.sizes.includes(input.lawnSizeCategory)) reasons.push("Lawn size needs confirmation.");
  if (config.review.conditions.includes(input.lawnCondition)) reasons.push("Lawn condition needs a closer review.");
  if (config.review.properties.includes(input.propertyType)) reasons.push("Property scope needs individual review.");
  if (config.review.frequencies.includes(input.frequency)) reasons.push("Visit frequency needs confirmation.");
  if (services.some((service) => config.services[service.slug].requiresReview)) reasons.push("A selected service needs specialist review.");
  if (services.length >= config.review.serviceCount || config.review.combinations.some((group) => group.every((slug) => services.some((service) => service.slug === slug)))) reasons.push("The service combination may have overlapping work; we’ll confirm the scope.");
  const denominator = BigInt(10000) ** BigInt(factors.length);
  const step = BigInt(config.roundingIncrementCents);
  const minimum = BigInt(config.minimumVisitCents);
  let minimumApplied = false;
  function calculate(side: "minimum" | "maximum") {
    let numerator = lines.reduce((sum, line) => sum + BigInt(line.base[`${side}Cents`]), BigInt(0));
    for (const factor of factors) numerator *= BigInt(factor[`${side}Bps`]);
    if (numerator < minimum * denominator) { numerator = minimum * denominator; minimumApplied = true; }
    const divisor = denominator * step;
    const rounded = (side === "minimum" ? numerator / divisor : (numerator + divisor - BigInt(1)) / divisor) * step;
    // A non-aligned configured minimum must never be rounded below itself.
    const result = rounded < minimum ? ((minimum + step - BigInt(1)) / step) * step : rounded;
    if (result > BigInt(999999999999)) throw new Error("Estimate exceeds money storage bounds");
    return Number(result);
  }
  const minimumCents = calculate("minimum"); const maximumCents = calculate("maximum");
  if (maximumCents >= config.highEstimateCents) reasons.push("The estimated scope needs additional review.");
  const snapshot: EstimatedSnapshot = { schemaVersion: 1, pricingVersion: config.version, developmentPricing: config.developmentPricing, currency: "ZAR", calculatedAt: calculatedAt.toISOString(), inputs: input, status: "estimated", minimumCents, maximumCents, services: lines, factors, minimumVisitCents: config.minimumVisitCents, minimumApplied, roundingIncrementCents: config.roundingIncrementCents, rounding: "outward", requiresHumanReview: reasons.length > 0, reviewReasons: reasons };
  return snapshotSchema.parse(snapshot);
}

export function estimateForSubmission(input: EstimatorInput, now: Date, config: PricingConfig = developmentPricing): EstimateSnapshot {
  // Invalid/untrusted service inputs are not an estimation fallback. The caller
  // has already validated UUID ownership/active state against the database.
  const validated = estimatorInputSchema.parse(input);
  try { return estimateQuote(validated, config, now); }
  catch { console.error("quote_estimation_unavailable"); return reviewOnly(validated, typeof config.version === "string" ? config.version.slice(0, 80) || "unavailable" : "unavailable", now, true, "Automatic estimation is unavailable; a team member will review your request."); }
}
