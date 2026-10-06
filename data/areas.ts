import type { FAQItem, Seo } from "./types";

export type Area = {
  name: string;
  slug: string;
  summary: string;
  description: string;
  planningTitle: string;
  planningNotes: string[];
  serviceSlugs: string[];
  faq: FAQItem[];
  seo: Seo;
};

export const coverageNotice =
  "Planned service areas · Coverage and appointment availability must be confirmed for your address. Online bookings are not open yet.";

export const areas: Area[] = [
  {
    name: "Benoni",
    slug: "benoni",
    summary:
      "Plan a lawn cut, a garden reset or a regular care routine in Benoni.",
    description:
      "For a Benoni enquiry, start with the garden itself: which areas are lawn, which are planted beds and where the work is needed. A lawn cut and a bed cleanup involve different tasks, so describing them separately helps establish a useful scope.",
    planningTitle: "Planning a garden reset in Benoni",
    planningNotes: [
      "Describe the lawn size and any narrow access between the entrance and garden.",
      "Identify beds to tidy and plants that should be left untouched.",
      "Mention whether green waste can stay at a compost point or needs removal quoted.",
    ],
    serviceSlugs: [
      "grass-cutting",
      "garden-cleanup",
      "recurring-lawn-maintenance",
      "lawn-edging",
    ],
    faq: [
      {
        question: "Can I combine a Benoni garden cleanup with mowing?",
        answer:
          "These can be discussed together. Describe each area and the waste involved so both tasks can be reviewed in one proposed scope.",
      },
      {
        question: "Is my Benoni address covered?",
        answer:
          "Benoni is a planned service area. Your suburb and access details will be needed to confirm coverage; this page does not guarantee a visit.",
      },
    ],
    seo: {
      title: "Lawn Care in Benoni",
      description:
        "Explore planned LawnFlow services in Benoni, from grass cutting to garden cleanup and recurring care. Address coverage requires confirmation.",
    },
  },
  {
    name: "Boksburg",
    slug: "boksburg",
    summary: "Coordinate lawn and yard care for your Boksburg property.",
    description:
      "A Boksburg enquiry can cover the lawn and the outdoor spaces around it. Separate mowing needs from paths, courtyards and loose garden debris to help make the work and disposal arrangements clear, especially where an entrance is shared.",
    planningTitle: "Organising access and cleanup in Boksburg",
    planningNotes: [
      "Explain which yard areas need sweeping or clearing alongside the lawn cut.",
      "For a shared property, identify who can approve work and arrange entry.",
      "Flag rubble or non-garden waste early; specialist disposal is outside routine yard care.",
    ],
    serviceSlugs: [
      "grass-cutting",
      "yard-cleanup",
      "garden-cleanup",
      "recurring-lawn-maintenance",
    ],
    faq: [
      {
        question: "Can you include a Boksburg courtyard with the lawn enquiry?",
        answer:
          "Yes, describe it as a separate yard-cleanup task. Routine sweeping and light organic debris differ from pressure washing or rubble removal, which are not included.",
      },
      {
        question: "What if the entrance is shared?",
        answer:
          "Please explain access arrangements and who is authorised to approve the visit. Coverage and a suitable time still need confirmation.",
      },
    ],
    seo: {
      title: "Lawn Care in Boksburg",
      description:
        "Explore planned lawn, garden and yard-care services in Boksburg, with guidance on access and cleanup scope. Coverage is subject to confirmation.",
    },
  },
  {
    name: "Kempton Park",
    slug: "kempton-park",
    summary:
      "Plan repeat lawn care or discuss the needs of shared grounds in Kempton Park.",
    description:
      "For a Kempton Park property that needs ongoing attention, tell us how the outdoor space is used and when it can be accessed. Regular care starts with an agreed task list, whether it is a home lawn or grounds managed by a designated site contact.",
    planningTitle: "Preparing for repeat care in Kempton Park",
    planningNotes: [
      "List the tasks needed on every visit and those that are occasional.",
      "Share preferred visit times and any business or estate access restrictions.",
      "Nominate a contact who can discuss changes to the scope or schedule.",
    ],
    serviceSlugs: [
      "recurring-lawn-maintenance",
      "commercial-lawn-maintenance",
      "grass-cutting",
      "garden-cleanup",
    ],
    faq: [
      {
        question: "Can I discuss care for a business property in Kempton Park?",
        answer:
          "Yes. Describe the lawn area, operating hours and site approval process. Suitability, coverage and scheduling are reviewed before any commitment.",
      },
      {
        question: "Can I reserve recurring visits now?",
        answer:
          "Online scheduling is not open. You can review the planned services here and use WhatsApp for an enquiry if the business number has been configured.",
      },
    ],
    seo: {
      title: "Lawn Care in Kempton Park",
      description:
        "Explore planned LawnFlow care in Kempton Park for home lawns and shared grounds, including repeat-visit planning. Coverage must be confirmed.",
    },
  },
];

export function getArea(slug: string) {
  return areas.find((area) => area.slug === slug);
}
