import type { PriceRange } from "./types";

export function centsToDecimal(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > 999999999999) throw new Error("Invalid money amount");
  const value = BigInt(cents);
  return `${value / BigInt(100)}.${(value % BigInt(100)).toString().padStart(2, "0")}`;
}
const wholeRand = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const centsRand = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function formatZar(cents: number): string {
  centsToDecimal(cents);
  // Division is presentation-only; persisted money uses exact decimal strings.
  return (cents % 100 === 0 ? wholeRand : centsRand).format(cents / 100);
}
export function formatEstimateRange(range: PriceRange): string { return `${formatZar(range.minimumCents)} – ${formatZar(range.maximumCents)}`; }
