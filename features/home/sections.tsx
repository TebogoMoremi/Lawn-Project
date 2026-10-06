import { ButtonLink } from "@/components/ui/button-link";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { siteConfig } from "@/lib/config";
import { services, steps } from "./content";

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
          {services.map((service) => (
            <article className="service-card" key={service.number}>
              <div className="service-symbol" aria-hidden="true">
                {service.symbol}
              </div>
              <p className="eyebrow">{service.detail}</p>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href="/quote">
                Enquire about this service <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
        <p className="section-note">
          Service preview · Full service details and coverage will be confirmed
          before launch.
        </p>
      </section>
      <section className="process-section" id="how-it-works">
        <div className="container section">
          <p className="eyebrow">FROM TO-DO TO TA-DA</p>
          <h2>A simpler way to a tidy garden.</h2>
          <p className="intro">
            Here’s how LawnFlow will work when bookings open.
          </p>
          <div className="steps">
            {steps.map((step, index) => (
              <article key={step.title}>
                <span className="step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="about" className="section container values">
        <div>
          <p className="eyebrow">GROUNDED IN GOOD CARE</p>
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
      <section id="areas" className="container area-note">
        <span className="eyebrow">GROWING LOCALLY</span>
        <h2>Closer to home.</h2>
        <p>
          Our service areas are being finalised. Coverage details will be
          published before bookings open.
        </p>
      </section>
      <section id="contact" className="container final-cta">
        <p className="eyebrow">LET’S MAKE ROOM FOR MORE GREEN</p>
        <h2>
          A lawn you love.
          <br />A weekend that’s yours.
        </h2>
        <p>Start with a conversation. We’ll take it from there.</p>
        <div className="button-row">
          <ButtonLink href="/quote">
            Get Free Quote <span aria-hidden="true">↗</span>
          </ButtonLink>
          <WhatsAppLink />
        </div>
        <p className="contact-status">
          {siteConfig.whatsappNumber
            ? "WhatsApp opens a direct enquiry. This does not create a quote or booking."
            : "Development preview: WhatsApp is not connected yet. Online quote requests are coming soon."}
        </p>
      </section>
    </>
  );
}
