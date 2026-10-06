import type { Service } from "./types";

export const services: Service[] = [
  {
    name: "Grass Cutting",
    slug: "grass-cutting",
    symbol: "✳",
    shortDescription:
      "An even cut and a tidy finish for everyday outdoor living.",
    description:
      "Keep usable lawn areas neat with a cut suited to the grass and its current condition. Tell us about slopes, access and any overgrown patches so the scope can be reviewed before a visit.",
    benefits: [
      "A more usable lawn",
      "A consistent finish across accessible areas",
      "Care planned around the condition of your grass",
    ],
    included: [
      "Review of accessible mowing areas",
      "Grass cutting at an agreed height",
      "Clearing clippings from adjacent paths",
    ],
    faq: [
      {
        question: "Can you cut a very overgrown lawn?",
        answer:
          "Share its condition when enquiring. Long or wet grass may need a staged cut, extra time or a different visit date; this is reviewed before a quote is confirmed.",
      },
      {
        question: "Is edging included?",
        answer:
          "Edging is a separate service that can be included in the same agreed quote. Let us know which borders need attention.",
      },
    ],
    seo: {
      title: "Grass Cutting",
      description:
        "Explore LawnFlow grass cutting, what a visit includes and how to prepare a lawn-care enquiry.",
    },
  },
  {
    name: "Lawn Edging",
    slug: "lawn-edging",
    symbol: "〰",
    shortDescription: "Defined lawn borders along paths, beds and driveways.",
    description:
      "Edging brings definition to the places a mower cannot finish neatly. We plan the work around existing borders and nearby planting, with the extent of reshaping agreed in advance.",
    benefits: [
      "Clearer garden borders",
      "A neat finish beside hard surfaces",
      "Attention to awkward lawn edges",
    ],
    included: [
      "Review of existing lawn boundaries",
      "Trimming along agreed borders",
      "Sweeping loose clippings from adjoining surfaces",
    ],
    faq: [
      {
        question: "Will edging create new garden beds?",
        answer:
          "This service follows existing borders. Creating or redesigning beds is a separate scope and is not included in routine edging.",
      },
    ],
    seo: {
      title: "Lawn Edging",
      description:
        "See how LawnFlow lawn edging can tidy existing borders beside garden beds, paths and driveways.",
    },
  },
  {
    name: "Garden Cleanup",
    slug: "garden-cleanup",
    symbol: "↟",
    shortDescription:
      "A considered tidy-up for beds, leaves and garden clutter.",
    description:
      "Start with the parts of the garden that need attention most. A cleanup can focus on fallen leaves, light organic debris and untidy beds, while protecting the plants you want to keep.",
    benefits: [
      "Easier access to garden beds",
      "A clearer view of plants needing care",
      "A manageable starting point for regular upkeep",
    ],
    included: [
      "Walk-through of agreed cleanup areas",
      "Collection of leaves and light garden debris",
      "Gathering green waste at an agreed point",
    ],
    faq: [
      {
        question: "Is green waste removal included?",
        answer:
          "Removal and disposal must be agreed in the quote. Tell us the likely volume and whether there is an on-site compost or collection point.",
      },
      {
        question: "Can I identify plants to keep?",
        answer:
          "Yes. Mark plants or describe them before work begins. Uncertain plants should be left in place until you confirm.",
      },
    ],
    seo: {
      title: "Garden Cleanup",
      description:
        "Plan a LawnFlow garden cleanup for leaves, light debris and garden beds, with a clear scope and waste arrangements.",
    },
  },
  {
    name: "Hedge Trimming",
    slug: "hedge-trimming",
    symbol: "❧",
    shortDescription: "Routine shaping to keep reachable hedges neat.",
    description:
      "Maintain an existing hedge shape with a trim appropriate to its condition. Height, width, access and the amount to be removed all matter when agreeing a safe, practical scope.",
    benefits: [
      "Tidier hedge lines",
      "Clearer paths beside planting",
      "A shape agreed before trimming starts",
    ],
    included: [
      "Review of hedge condition and access",
      "Trimming of agreed reachable growth",
      "Collection of hedge clippings",
    ],
    faq: [
      {
        question: "Do you remove trees or very tall hedges?",
        answer:
          "Specialist tree work and work requiring elevated access are outside this routine service. Describe the height and access so suitability can be checked.",
      },
    ],
    seo: {
      title: "Hedge Trimming",
      description:
        "Learn about routine LawnFlow hedge trimming, access requirements and what is included in a planned visit.",
    },
  },
  {
    name: "Weed Removal",
    slug: "weed-removal",
    symbol: "⌁",
    shortDescription: "Targeted attention to unwanted growth in agreed areas.",
    description:
      "Identify the beds or path edges where weeds are competing for space. The method and extent of removal are agreed around nearby plants and the condition of the site.",
    benefits: [
      "Less unwanted growth in selected areas",
      "More room around established plants",
      "A clearer basis for ongoing upkeep",
    ],
    included: [
      "Identification of areas to treat",
      "Manual removal of accessible weeds where appropriate",
      "Collection of removed plant material",
    ],
    faq: [
      {
        question: "Will weeds stay away permanently?",
        answer:
          "No. Regrowth and new seedlings are possible. Follow-up care may be needed; no permanent weed-free result is promised.",
      },
      {
        question: "Are chemicals included?",
        answer:
          "Chemical treatment is not included in this service preview. Any proposed treatment would need a separate suitability review and agreement.",
      },
    ],
    seo: {
      title: "Weed Removal",
      description:
        "Explore targeted LawnFlow weed removal for selected beds and edges, with realistic expectations about follow-up care.",
    },
  },
  {
    name: "Yard Cleanup",
    slug: "yard-cleanup",
    symbol: "↗",
    shortDescription:
      "Restore order to paths, courtyards and outdoor living areas.",
    description:
      "Focus on the outdoor spaces around the lawn: paths, patios and accessible yard areas. Describe what needs clearing so garden debris can be distinguished from items requiring specialist disposal.",
    benefits: [
      "Tidier outdoor living areas",
      "Clearer everyday walkways",
      "An agreed plan for collected debris",
    ],
    included: [
      "Review of accessible yard areas",
      "Sweeping and collection of light organic debris",
      "Gathering agreed waste for collection",
    ],
    faq: [
      {
        question: "Do you remove building rubble or hazardous waste?",
        answer:
          "No. Rubble, chemicals, sharp objects and hazardous materials are outside the scope of this yard-care service.",
      },
    ],
    seo: {
      title: "Yard Cleanup",
      description:
        "See the scope of LawnFlow yard cleanup for paths, patios and light outdoor debris.",
    },
  },
  {
    name: "Recurring Lawn Maintenance",
    slug: "recurring-lawn-maintenance",
    symbol: "⟳",
    shortDescription: "An agreed care routine that adapts to your lawn.",
    description:
      "Plan repeat visits around growth, seasonal conditions and the work your garden needs. The service mix, frequency and arrangements should be clear before a recurring schedule begins.",
    benefits: [
      "A more consistent care routine",
      "Less need to organise each task separately",
      "Scope that can be reviewed as needs change",
    ],
    included: [
      "An agreed list of recurring tasks",
      "A proposed visit frequency",
      "Review of access and ongoing care requirements",
    ],
    faq: [
      {
        question: "Can I choose weekly or fortnightly visits?",
        answer:
          "You can state your preference. Frequency and availability will be confirmed with you when bookings open, based on growth and the agreed scope.",
      },
      {
        question: "Is a recurring schedule available online now?",
        answer:
          "Not yet. This page describes the planned service; it does not create a schedule or reserve visits.",
      },
    ],
    seo: {
      title: "Recurring Lawn Maintenance",
      description:
        "Explore LawnFlow recurring lawn maintenance and how visit frequency, tasks and access will be agreed.",
    },
  },
  {
    name: "Commercial Lawn Maintenance",
    slug: "commercial-lawn-maintenance",
    symbol: "▦",
    shortDescription:
      "Practical lawn-care planning for shared and business spaces.",
    description:
      "Plan grounds care around the people using a commercial property. A site review considers lawn size, pedestrian access, operating hours and the contact responsible for approving work.",
    benefits: [
      "A defined scope for shared grounds",
      "Visits planned around site access",
      "A clear contact for work approvals",
    ],
    included: [
      "Review of site and access requirements",
      "An agreed mowing and tidying scope",
      "Coordination with the designated site contact",
    ],
    faq: [
      {
        question: "Can visits be planned around business hours?",
        answer:
          "Include operating hours and any restricted times in your enquiry. Timing is subject to availability and must be confirmed before work is scheduled.",
      },
    ],
    seo: {
      title: "Commercial Lawn Maintenance",
      description:
        "Plan commercial lawn care with LawnFlow, including site access, approved tasks and communication requirements.",
    },
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
