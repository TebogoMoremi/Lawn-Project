import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { areas, getArea, coverageNotice } from "@/data/areas";
import { services } from "@/data/services";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { FAQ } from "@/components/public/faq";
import { HowItWorks } from "@/components/public/how-it-works";
import { CTASection } from "@/components/public/cta-section";

export function generateStaticParams() {
  return areas.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: PageProps<"/areas/[slug]">): Promise<Metadata> {
  const area = getArea((await params).slug);
  if (!area) notFound();
  return area.seo;
}
export default async function AreaPage({ params }: PageProps<"/areas/[slug]">) {
  const area = getArea((await params).slug);
  if (!area) notFound();
  const message = `Hi LawnFlow, I would like to enquire about lawn care in ${area.name}.`;
  return (
    <main id="main-content">
      <PageHero
        eyebrow="PLANNED LOCAL CARE"
        title={`Lawn care in ${area.name}`}
        description={area.summary}
        parent={{ href: "/areas", label: "Areas" }}
        message={message}
      />
      <section className="container section">
        <h2>{area.planningTitle}</h2>
        <p className="prose intro">{area.description}</p>
        <ul className="planning-list">
          {area.planningNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="coverage-notice">{coverageNotice}</p>
      </section>
      <section className="container section">
        <h2>Services to discuss in {area.name}.</h2>
        <div className="service-grid section-grid">
          {services
            .filter((service) => area.serviceSlugs.includes(service.slug))
            .map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
        </div>
      </section>
      <HowItWorks />
      <FAQ items={area.faq} />
      <CTASection message={message} />
    </main>
  );
}
