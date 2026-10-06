import { ButtonLink } from "@/components/ui/button-link";
import { getWhatsAppUrl, siteConfig } from "@/lib/config";

export function WhatsAppLink({ message }: { message?: string }) {
  const url = getWhatsAppUrl(siteConfig.whatsappNumber, message);
  return (
    <ButtonLink secondary href={url ?? "/contact#whatsapp-status"}>
      WhatsApp Us <span aria-hidden="true">↗</span>
    </ButtonLink>
  );
}
