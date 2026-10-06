import { services } from "../data/services";
import { areas } from "../data/areas";

// Reference content only. No customer, review, booking or notification records.
export const serviceSeedData = services.map((service, sortOrder) => ({
  name: service.name,
  slug: service.slug,
  shortDescription: service.shortDescription,
  description: service.description,
  benefits: service.benefits,
  included: service.included,
  symbol: service.symbol,
  faq: service.faq,
  seoTitle: service.seo.title,
  seoDescription: service.seo.description,
  sortOrder,
}));

export const areaSeedData = areas.map((area) => ({
  name: area.name,
  slug: area.slug,
  city: area.name,
  province: "Gauteng",
  description: area.description,
  serviceSlugs: area.serviceSlugs,
}));
