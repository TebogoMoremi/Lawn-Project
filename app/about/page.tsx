import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/public/page-hero";
import { HowItWorks } from "@/components/public/how-it-works";
import { CTASection } from "@/components/public/cta-section";

export const metadata: Metadata = {
  title: "About LawnFlow",
  description:
    "Get to know LawnFlow’s approach to lawn and garden care: clear scope, personal communication and human-reviewed quotes.",
};
export default function AboutPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="GROUNDED IN GOOD CARE"
        title="Your outdoor space. A personal touch."
        description="We’re building LawnFlow to make grass cutting, garden cleanup and ongoing lawn care easier to organise, with a clear conversation at every step."
      />
      <section className="container section about-grid">
        <div>
          <h2>Care starts with understanding.</h2>
          <p className="intro">
            Every garden asks for something different. Our approach begins with
            the work you need, the condition of your outdoor space and the
            practical details of access.
          </p>
          <p className="intro">
            A clear quote should explain the agreed tasks, waste arrangements
            and price. An estimate is a starting point; a person reviews the
            details before the final quote is confirmed.
          </p>
          <h3 className="intro">Communication you can plan around</h3>
          <p className="intro">
            Reliability means agreeing a time and scope, and discussing changes
            when weather, access or garden conditions affect the plan. We aim to
            keep those decisions clear instead of leaving you to guess.
          </p>
          <p className="intro">
            This site is a development preview. Our focus is lawn and garden
            care; online booking and message delivery will follow in later
            stages.
          </p>
        </div>
        <figure className="about-figure">
          <Image
            src="/images/garden-illustration.svg"
            width={680}
            height={740}
            sizes="(max-width: 800px) 90vw, 45vw"
            alt="Concept garden illustration with a striped lawn, planting and stepping stones"
          />
          <figcaption>Concept illustration · Not a customer project</figcaption>
        </figure>
      </section>
      <HowItWorks />
      <CTASection />
    </main>
  );
}
