import Image from "next/image";
import type { GalleryProject } from "@/data/gallery";

export function GalleryCard({ project }: { project: GalleryProject }) {
  return (
    <article className="gallery-card" id={project.slug}>
      <div className="comparison">
        {(["before", "after"] as const).map((stage) => (
          <figure key={stage}>
            <Image
              {...project[stage]}
              sizes="(max-width: 600px) 90vw, (max-width: 900px) 44vw, 28vw"
              alt={project[stage].alt}
            />
            <figcaption>
              {stage === "before" ? "Before" : "After"} · Concept illustration
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery-copy">
        <p className="eyebrow">{project.category} · DEMO</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
    </article>
  );
}
