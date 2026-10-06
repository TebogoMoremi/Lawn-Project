import type { Metadata } from "next";
import { areas, coverageNotice } from "@/data/areas";
import { PageHero } from "@/components/public/page-hero";
import { AreaCard } from "@/components/public/area-card";
import { CTASection } from "@/components/public/cta-section";

export const metadata: Metadata = {
  title: "Planned Service Areas",
  description:
    "Explore LawnFlow’s planned service areas: Benoni, Boksburg and Kempton Park. Coverage requires confirmation for your address.",
};
export default function AreasPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="GROWING LOCALLY"
        title="Closer to home."
        description="We’re planning lawn and garden care in Benoni, Boksburg and Kempton Park. Start with your area to see how to prepare an enquiry."
      />
      <section className="container section">
        <h2>Find your area.</h2>
        <p className="intro">{coverageNotice}</p>
        <div className="service-grid section-grid">
          {areas.map((area) => (
            <AreaCard key={area.slug} area={area} />
          ))}
        </div>
        <p className="intro">
          Outside these areas? Coverage is still being planned. Ask about your
          location when direct enquiries are available; please do not assume a
          visit can be arranged.
        </p>
      </section>
      <CTASection />
    </main>
  );
}
