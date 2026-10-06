import type { Metadata } from "next";
import Link from "next/link";
import { galleryProjects } from "@/data/gallery";
import { PageHero } from "@/components/public/page-hero";
import { GalleryCard } from "@/components/public/gallery-card";
import { CTASection } from "@/components/public/cta-section";

export const metadata: Metadata = {
  title: "Garden Care Concepts",
  description:
    "Browse clearly labelled before-and-after lawn and garden care illustrations. These demo concepts are not LawnFlow customer projects.",
};
export default function GalleryPage() {
  return (
    <main id="main-content">
      <PageHero
        eyebrow="A LITTLE OUTDOOR INSPIRATION"
        title="Picture the possibilities."
        description="Before-and-after concepts for a more cared-for outdoor space. Every image here is an illustration, not a real LawnFlow customer project."
      />
      <section className="container section">
        <h2>Explore the concepts.</h2>
        <nav className="category-links" aria-label="Gallery categories">
          {galleryProjects.map((project) => (
            <Link key={project.slug} href={`#${project.slug}`}>
              {project.category}
            </Link>
          ))}
        </nav>
        <div className="gallery-grid">
          {galleryProjects.map((project) => (
            <GalleryCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
      <CTASection />
    </main>
  );
}
