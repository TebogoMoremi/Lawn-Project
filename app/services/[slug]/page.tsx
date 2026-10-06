import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, services } from "@/data/services";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { FAQ } from "@/components/public/faq";
import { HowItWorks } from "@/components/public/how-it-works";
import { CTASection } from "@/components/public/cta-section";

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) notFound();
  return service.seo;
}

export default async function ServicePage({
  params,
}: PageProps<"/services/[slug]">) {
  const service = getService((await params).slug);
  if (!service) notFound();
  const message = `Hi LawnFlow, I would like to enquire about ${service.name.toLowerCase()}.`;
  return (
    <main id="main-content">
      <PageHero
        eyebrow="A LITTLE CARE GOES A LONG WAY"
        title={service.name}
        description={service.shortDescription}
        parent={{ href: "/services", label: "Services" }}
        message={message}
      />
      <section className="container section">
        <h2>Care with a clear scope.</h2>
        <p className="prose intro">{service.description}</p>
        <div className="detail-columns">
          <div>
            <h3>Why choose this service?</h3>
            <ul>
              {service.benefits.map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>What’s included</h3>
            <ul>
              {service.included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Final scope, waste removal and availability are confirmed in your
              quote.
            </p>
          </div>
        </div>
      </section>
      <HowItWorks />
      <FAQ items={service.faq} />
      <section className="container section">
        <h2>More ways to care for your garden.</h2>
        <div className="service-grid section-grid">
          {services
            .filter((item) => item.slug !== service.slug)
            .slice(0, 3)
            .map((item) => (
              <ServiceCard key={item.slug} service={item} />
            ))}
        </div>
      </section>
      <CTASection message={message} />
    </main>
  );
}
