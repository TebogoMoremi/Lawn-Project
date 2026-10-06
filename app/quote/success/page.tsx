import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
import { hashToken } from "@/lib/quotes/service";
import { receiptCookie } from "@/lib/quotes/config";
import { quoteWhatsAppMessage } from "@/features/quote/helpers";
import { siteConfig, getWhatsAppUrl } from "@/lib/config";
import { ButtonLink } from "@/components/ui/button-link";
import { EstimateSummary } from "@/features/quote/estimation/estimate-summary";
import { readEstimateSnapshot } from "@/features/quote/estimation/types";
import { formatEstimateRange } from "@/features/quote/estimation/money";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your quote request",
  robots: { index: false, follow: false },
};

export default async function QuoteSuccessPage() {
  const token = (await cookies()).get(receiptCookie)?.value;
  let receipt = null;
  if (token && /^[a-f0-9]{64}$/.test(token) && process.env.DATABASE_URL) {
    try {
      receipt = await getDb().quote.findFirst({
        where: {
          submissionTokenHash: hashToken(token),
          receiptExpiresAt: { gt: new Date() },
        },
        select: {
          reference: true,
          estimateSnapshot: true,
          customer: { select: { firstName: true } },
          items: { select: { serviceName: true } },
        },
      });
    } catch {
      console.error("quote_receipt_unavailable");
    }
  }
  if (!receipt)
    return (
      <main id="main-content" className="container quote-page">
        <h1>Private confirmation unavailable</h1>
        <section className="quote-panel">
          <p>
            This confirmation may have expired or belongs to another browser. If
            you already submitted, contact LawnFlow before sending another
            request.
          </p>
          <ButtonLink href="/contact">Contact LawnFlow</ButtonLink>
        </section>
      </main>
    );
  const serviceNames = receipt.items.map((item) => item.serviceName);
  const estimate = readEstimateSnapshot(receipt.estimateSnapshot);
  const whatsapp = getWhatsAppUrl(
    siteConfig.whatsappNumber,
    quoteWhatsAppMessage(receipt.reference, serviceNames, estimate?.status === "estimated" ? { range: formatEstimateRange(estimate), developmentPricing: estimate.developmentPricing } : undefined),
  );
  return (
    <main id="main-content" className="container quote-page">
      <p className="eyebrow">REQUEST RECEIVED</p>
      <h1>
        Thanks, <em>{receipt.customer.firstName}.</em>
      </h1>
      <section className="quote-panel">
        <h2>We’ve received your request</h2>
        <p className="quote-reference">
          Reference: <strong>{receipt.reference}</strong>
        </p>
        <ul>
          {serviceNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p>
          Your request will be reviewed before a final quote is confirmed. Save
          your reference; this private confirmation is available for 24 hours.
        </p>
      </section>
      <EstimateSummary snapshot={receipt.estimateSnapshot} />
      <section className="quote-panel">
        <h2>What happens next</h2>
        <ol>
          <li>LawnFlow reviews your request.</li>
          <li>You choose availability when arranged with LawnFlow.</li>
          <li>A final quote is confirmed.</li>
          <li>You accept the quote.</li>
          <li>Your booking is confirmed.</li>
        </ol>
        <p>
          Online availability and booking are planned for a future update. No
          appointment is booked, no price is confirmed, and no email or SMS has
          been sent by this form.
        </p>
      </section>
      <div className="button-row">
        {whatsapp && (
          <ButtonLink href={whatsapp}>Continue on WhatsApp</ButtonLink>
        )}
        <ButtonLink href="/" secondary>
          Back to home
        </ButtonLink>
      </div>
    </main>
  );
}
