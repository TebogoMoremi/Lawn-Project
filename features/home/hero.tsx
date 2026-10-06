import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { WhatsAppLink } from "@/components/whatsapp-link";

export function Hero() {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="status-dot" /> MORE GREEN. LESS HASSLE.
        </p>
        <h1>
          Professional
          <br />
          Lawn Care,
          <br />
          <em>Without the Hassle.</em>
        </h1>
        <p className="hero-description">
          Reliable grass cutting, garden maintenance and lawn care delivered to
          your doorstep.
        </p>
        <div className="button-row">
          <ButtonLink href="/quote">
            Get Free Quote <span aria-hidden="true">↗</span>
          </ButtonLink>
          <WhatsAppLink />
        </div>
        <p className="quiet-note">Your garden. Our care. More time for you.</p>
      </div>
      <figure className="hero-visual">
        <Image
          src="/images/garden-illustration.svg"
          alt="Illustrated garden with a striped green lawn, stepping stones and leafy planting"
          width={680}
          height={740}
          preload
          sizes="(max-width: 800px) 90vw, 45vw"
        />
        <div className="garden-caption">
          <span className="garden-icon" aria-hidden="true">
            ✳
          </span>
          <div>
            <strong>A greener kind of weekend.</strong>
            <span>Leave a little more time for living.</span>
          </div>
        </div>
        <figcaption>
          Concept illustration · Real project photos coming soon
        </figcaption>
      </figure>
    </section>
  );
}
