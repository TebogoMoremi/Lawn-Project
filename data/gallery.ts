export type GalleryProject = {
  slug: string;
  category: string;
  title: string;
  description: string;
  before: { src: string; alt: string; width: number; height: number };
  after: { src: string; alt: string; width: number; height: number };
};

// Concept assets can be replaced with approved project images without changing cards.
export const galleryProjects: GalleryProject[] = [
  {
    slug: "grass-cutting",
    category: "Grass Cutting",
    title: "A more even lawn",
    description:
      "Illustrated comparison of long grass and a tidy cut. This is a design concept, not a recorded result.",
  },
  {
    slug: "garden-cleanup",
    category: "Garden Cleanup",
    title: "Room around the planting",
    description:
      "Illustrated comparison of scattered garden debris and a cleared bed. No customer property is shown.",
  },
  {
    slug: "hedge-trimming",
    category: "Hedge Trimming",
    title: "A defined hedge line",
    description:
      "Illustrated comparison of uneven growth and a shaped hedge. Actual scope depends on plant condition.",
  },
  {
    slug: "lawn-maintenance",
    category: "Lawn Maintenance",
    title: "Care over time",
    description:
      "Illustrated comparison of an untidy garden and a maintenance concept. This is not a promise of a particular result.",
  },
].map((project) => ({
  ...project,
  before: {
    src: `/images/${project.slug}-before.svg`,
    alt: `Before concept: ${project.category.toLowerCase()} area needing attention`,
    width: 680,
    height: 480,
  },
  after: {
    src: `/images/${project.slug}-after.svg`,
    alt: `After concept: ${project.category.toLowerCase()} area after an illustrated tidy-up`,
    width: 680,
    height: 480,
  },
}));
