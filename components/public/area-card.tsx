import Link from "next/link";
import type { Area } from "@/data/areas";

export function AreaCard({ area }: { area: Area }) {
  return (
    <article className="service-card">
      <p className="eyebrow">PLANNED COVERAGE</p>
      <h3>{area.name}</h3>
      <p>{area.summary}</p>
      <Link href={`/areas/${area.slug}`}>
        Explore {area.name} <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
