import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { QuoteForm } from "@/features/quote/quote-form";
import { getDb } from "@/lib/db";
import { uploadLimits } from "@/lib/quotes/config";
import type { QuoteServiceOption } from "@/features/quote/validation";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Request a free quote",
  description:
    "Tell LawnFlow about your garden and request a quote for review.",
};
export default async function QuotePage() {
  let services: QuoteServiceOption[] = [];
  let limits: ReturnType<typeof uploadLimits> | undefined;
  try {
    limits = uploadLimits();
    if (process.env.DATABASE_URL)
      services = await getDb().service.findMany({
        where: { active: true },
        select: { id: true, name: true, shortDescription: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
  } catch {
    console.error("quote_catalog_unavailable");
  }
  return (
    <main id="main-content" className="container quote-page">
      <p className="eyebrow">A LITTLE ABOUT YOUR GARDEN</p>
      <h1>
        Request a <em>free quote.</em>
      </h1>
      {services.length > 0 && limits ? (
        <>
          <p className="quote-intro">
            Tell us what needs doing. We’ll review your request before
            confirming a price. This does not book an appointment.
          </p>
          <QuoteForm services={services} limits={limits} />
        </>
      ) : (
        <section className="quote-panel">
          <h2>Requests are temporarily unavailable</h2>
          <p>
            We’re not accepting online requests at the moment. No request has
            been created. Please check back or use our contact options.
          </p>
          <div className="button-row">
            <ButtonLink href="/services">Explore services</ButtonLink>
            <WhatsAppLink />
          </div>
        </section>
      )}
    </main>
  );
}
