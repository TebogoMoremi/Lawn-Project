import Link from "next/link";
import type { Service } from "@/data/types";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <div className="service-symbol" aria-hidden="true">
        {service.symbol}
      </div>
      <h3>{service.name}</h3>
      <p>{service.shortDescription}</p>
      <div className="card-actions">
        <Link
          href={`/services/${service.slug}`}
          aria-label={`Learn more about ${service.name}`}
        >
          Learn More <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/quote" aria-label={`Get a quote for ${service.name}`}>
          Get Quote <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
