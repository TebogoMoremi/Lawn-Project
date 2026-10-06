import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { WhatsAppLink } from "@/components/whatsapp-link";

export const metadata: Metadata = { title: "Quote requests coming soon" };

export default function QuotePage() {
  return (
    <main id="main-content" className="container notice-page">
      <p className="eyebrow">WE’RE GETTING THE GARDEN READY</p>
      <h1>
        Quote requests
        <br />
        <em>are coming soon.</em>
      </h1>
      <p>
        This is the LawnFlow development preview. Online quote requests, photo
        uploads and availability selection are not open yet. No request has been
        created.
      </p>
      <div className="button-row">
        <ButtonLink href="/">Back to home</ButtonLink>
        <WhatsAppLink />
      </div>
    </main>
  );
}
