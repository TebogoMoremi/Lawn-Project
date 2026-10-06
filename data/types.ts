export type FAQItem = { question: string; answer: string };
export type Seo = { title: string; description: string };

export type Service = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  included: string[];
  symbol: string;
  faq: FAQItem[];
  seo: Seo;
};
