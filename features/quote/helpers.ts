export function formatQuoteReference(year: number, value: bigint) {
  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 9999 ||
    value < BigInt(1)
  )
    throw new Error("Invalid reference allocation.");
  return `LF-${year}-${value.toString().padStart(6, "0")}`;
}
export function referenceYear(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en", {
      year: "numeric",
      timeZone: "Africa/Johannesburg",
    }).format(date),
  );
}
export function quoteWhatsAppMessage(reference: string, services: string[], estimate?: { range: string; developmentPricing: boolean }) {
  const price = estimate ? `\n${estimate.developmentPricing ? "Development/demo estimated range" : "Estimated range"}: ${estimate.range} per visit (not a confirmed price)` : "";
  return `Hi LawnFlow,\n\nI submitted a quote request.\n\nReference: ${reference}\nServices: ${services.join(", ")}${price}\n\nI'd like some help with my request.`;
}
