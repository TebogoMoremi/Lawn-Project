import { readEstimateSnapshot } from "./types";
import { formatEstimateRange, formatZar } from "./money";

export function EstimateSummary({ snapshot: stored }: { snapshot: unknown }) {
  const snapshot = readEstimateSnapshot(stored);
  if (!snapshot || snapshot.status === "review_only") return <section className="quote-panel"><h2>Estimate pending review</h2><p>We’ll review your request and provide an estimate.</p><p>No automatic price is available. Your request has still been received.</p></section>;
  return <section className="quote-panel" aria-labelledby="estimate-heading"><h2 id="estimate-heading">Estimated price per visit</h2><p className="estimate-price">{formatEstimateRange(snapshot)}</p>
    {snapshot.developmentPricing && <p className="estimate-notice"><strong>Development pricing example.</strong> These configurable demonstration amounts are not verified LawnFlow commercial prices.</p>}
    <p>This is an estimated price based on the information provided. A LawnFlow team member will review your request and confirm the final quote.</p>
    {snapshot.requiresHumanReview && <p>We need to review a few details before confirming your final quote.</p>}
    <h3 className="estimate-subheading">Estimate based on</h3><ul>{snapshot.factors.map((factor) => <li key={factor.label}>{factor.label}</li>)}<li>Photos supplied: {snapshot.inputs.photoCount > 0 ? "Yes — available for human review; not analysed automatically" : "No"}</li></ul>
    <details><summary>How this estimate was calculated</summary><p>Starting service ranges, before property and frequency adjustments:</p><ul>{snapshot.services.map((service) => <li key={service.slug}>{service.name}: {formatEstimateRange(service.base)}</li>)}</ul><ul>{snapshot.factors.map((factor) => <li key={factor.label}>{factor.label}: ×{factor.minimumBps / 10000}{factor.maximumBps !== factor.minimumBps ? `–${factor.maximumBps / 10000}` : ""}</li>)}</ul><p>Factors are multiplied together. The minimum visit amount is {formatZar(snapshot.minimumVisitCents)}{snapshot.minimumApplied ? " and was applied" : ""}. The range is rounded outward in {formatZar(snapshot.roundingIncrementCents)} steps. Recurring adjustments apply per visit, not to a contract total.</p>{snapshot.reviewReasons.length > 0 && <ul>{snapshot.reviewReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>}</details>
  </section>;
}
