import Link from "next/link";
import { services } from "@/data/services";
import { areas, coverageNotice } from "@/data/areas";
import { generalFaq } from "@/data/faq";
import { galleryProjects } from "@/data/gallery";
import { ServiceCard } from "@/components/public/service-card";
import { AreaCard } from "@/components/public/area-card";
import { GalleryCard } from "@/components/public/gallery-card";
import { HowItWorks } from "@/components/public/how-it-works";
import { FAQ } from "@/components/public/faq";
import { CTASection } from "@/components/public/cta-section";

export function HomeSections() {
  return (
    <>
      <div className="promise-strip">
        <div className="container promise-inner">
          <span>✳ Thoughtful garden care</span>
          <span>✓ Human-reviewed quotes</span>
          <span>↗ Once-off or recurring</span>
          <span>♡ More time outdoors</span>
        </div>
      </div>
      <section id="services" className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A LITTLE CARE GOES A LONG WAY</p>
            <h2>Good gardens start here.</h2>
          </div>
          <p>
            From a quick trim to a fresh start.
            <br />
            Care that fits your outdoor space.
          </p>
        </div>
        <div className="service-grid">
          {[services[0], services[1], services[2]].map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <Link className="text-link" href="/services">
          Explore all services ↗
        </Link>
      </section>
      <HowItWorks />
      <section id="about" className="section container values">
        <div>
          <p className="eyebrow">WHY CHOOSE LAWNFLOW</p>
          <h2>
            Your outdoor space.
            <br />
            <em>A personal touch.</em>
          </h2>
          <p>
            We’re building LawnFlow around a simple idea: looking after your
            garden should feel straightforward, from the first conversation to
            the final tidy-up.
          </p>
          <Link className="text-link" href="/about">
            Get to know our approach ↗
          </Link>
        </div>
        <div className="value-list">
          <article>
            <span aria-hidden="true">01</span>
            <div>
              <h3>Clear from the start</h3>
              <p>
                Estimates are always labelled. A person reviews your request and
                confirms the final quote.
              </p>
            </div>
          </article>
          <article>
            <span aria-hidden="true">02</span>
            <div>
              <h3>Care on your terms</h3>
              <p>
                Plan a once-off refresh or request regular maintenance to suit
                your garden.
              </p>
            </div>
          </article>
          <article>
            <span aria-hidden="true">03</span>
            <div>
              <h3>People you can talk to</h3>
              <p>
                A direct conversation when you need a little help deciding what
                your lawn needs.
              </p>
            </div>
          </article>
        </div>
      </section>
      <section id="gallery" className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BEFORE & AFTER · CONCEPT PREVIEW</p>
            <h2>A little care changes the view.</h2>
          </div>
          <p>
            Illustrations only.
            <br />
            Not real customer projects.
          </p>
        </div>
        <GalleryCard project={galleryProjects[0]} />
        <Link className="text-link" href="/gallery">
          View all garden concepts ↗
        </Link>
      </section>
      <section id="areas" className="container section">
        <p className="eyebrow">GROWING LOCALLY</p>
        <h2>Closer to home.</h2>
        <p className="intro">{coverageNotice}</p>
        <div className="service-grid section-grid">
          {areas.map((area) => (
            <AreaCard key={area.slug} area={area} />
          ))}
        </div>
        <Link className="text-link" href="/areas">
          Explore planned coverage ↗
        </Link>
      </section>
      <FAQ items={generalFaq} />
      <div id="contact">
        <CTASection />
      </div>
    </>
  );
}
