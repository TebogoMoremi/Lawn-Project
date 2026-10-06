import { ButtonLink } from "@/components/ui/button-link";
import { WhatsAppLink } from "@/components/whatsapp-link";
import { siteConfig } from "@/lib/config";

export function CTASection({ message }: { message?: string }) {
  return (
    <section className="container final-cta">
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
        <WhatsAppLink message={message} />
      </div>
      <p className="contact-status">
        {siteConfig.whatsappNumber
          ? "WhatsApp opens a direct enquiry. This does not create a quote or booking."
          : "WhatsApp is not connected yet. Visit Get Free Quote to check online request availability."}
      </p>
    </section>
  );
}
