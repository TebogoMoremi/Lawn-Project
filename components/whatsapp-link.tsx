import { ButtonLink } from "@/components/ui/button-link";
import { getWhatsAppUrl, siteConfig } from "@/lib/config";

export function WhatsAppLink() {
  const url = getWhatsAppUrl(siteConfig.whatsappNumber);
  return (
    <ButtonLink secondary href={url ?? "/#contact"}>
      WhatsApp Us <span aria-hidden="true">↗</span>
    </ButtonLink>
  );
}
