import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { ContactForm } from "@/components/contact-form";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact LawnFlow",
  description:
    "Explore ways to enquire about LawnFlow lawn care. Online message delivery and quote requests are coming soon.",
};
export default function ContactPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="LET’S TALK ABOUT YOUR GARDEN"
        title="A conversation is a good start."
        description="Have a lawn-care question? Review the contact options below. Online quotes and message delivery are still being prepared."
      />
      <section className="container section contact-layout">
        <div>
          <h2>Prepare an enquiry.</h2>
          <p className="intro">
            Tell us the kind of care you’re interested in and your general area.
            There’s no need to include gate codes or other sensitive details.
          </p>
          <div id="whatsapp-status" className="coverage-notice" tabIndex={-1}>
            <h3>WhatsApp enquiries</h3>
            <p>
              {siteConfig.whatsappNumber
                ? "WhatsApp is configured. Use WhatsApp Us to open a direct enquiry; sending a message there does not confirm a booking."
                : "WhatsApp is not connected yet. No business number has been configured, so there is no WhatsApp link to open. Please check back when direct enquiries are available."}
            </p>
          </div>
          <p className="intro">
            Get Free Quote currently opens our coming-soon page. It does not
            create or reserve a request.
          </p>
        </div>
        <div>
          <h2>Contact form preview</h2>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
