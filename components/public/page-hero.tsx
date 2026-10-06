import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { WhatsAppLink } from "@/components/whatsapp-link";

export function PageHero({
  title,
  description,
  eyebrow,
  parent,
  message,
}: {
  title: string;
  description: string;
  eyebrow: string;
  parent?: { href: string; label: string };
  message?: string;
}) {
  return (
    <section className="page-hero container">
      <nav aria-label="Breadcrumb" className="breadcrumbs">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          {parent && (
            <li>
              <Link href={parent.href}>{parent.label}</Link>
            </li>
          )}
          <li aria-current="page">{title}</li>
        </ol>
      </nav>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="page-intro">{description}</p>
      <div className="button-row">
        <ButtonLink href="/quote">
          Get Free Quote <span aria-hidden="true">↗</span>
        </ButtonLink>
        <WhatsAppLink message={message} />
      </div>
    </section>
  );
}
