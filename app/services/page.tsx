import type { Metadata } from "next";
import { services } from "@/data/services";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { CTASection } from "@/components/public/cta-section";

export const metadata: Metadata = {
  title: "Lawn & Garden Services",
  description:
    "Explore LawnFlow grass cutting, edging, garden cleanup, hedge trimming and planned recurring lawn care.",
};

export default function ServicesPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="CARE FOR YOUR OUTDOOR SPACE"
        title="Good gardens start here."
        description="From a quick trim to a considered cleanup. Explore our service range and decide what your outdoor space needs."
      />
      <section className="container section">
        <h2>Find your kind of care.</h2>
        <p className="intro">
          Service scope and availability are confirmed before any work is
          agreed. Online quote requests are coming soon.
        </p>
        <div className="service-grid section-grid">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>
      <CTASection />
    </main>
  );
}
