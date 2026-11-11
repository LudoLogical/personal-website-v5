import { ChartColumn, HandCoins, Sprout } from "lucide-react";
import type {
  Demo,
  FeatureGroup,
  Picture,
  ProjectPhoto,
  Receipt,
  ResearchActivity,
  Service,
  Stakeholders,
  TeamMember,
} from "./types";

// Listed in the order in which a non-profit leader would encounter them
export const DEMOS: Demo[] = [
  {
    src: "/case-studies/vibrant-grants/demos/search.webm",
    caption: "Find the perfect grant opportunity",
  },
  {
    src: "/case-studies/vibrant-grants/demos/collaboration.webm",
    caption: "Team up with other like-minded organizations",
  },
  {
    src: "/case-studies/vibrant-grants/demos/sources.webm",
    caption: "Draw from curated and familiar data sources",
  },
  {
    src: "/case-studies/vibrant-grants/demos/conversation.webm",
    caption: "Convert simple conversations into usable impact data",
  },
  {
    src: "/case-studies/vibrant-grants/demos/analysis.webm",
    caption:
      "Understand relevant data and use it to strengthen grant applications",
  },
  {
    src: "/case-studies/vibrant-grants/demos/tracking.webm",
    caption: "Stay on top of every grant from start to finish",
  },
];

export const TIMELINE = { start: "2026-01", end: "2026-07" };

export const CLIENT = {
  name: "New Sun Rising",
  href: "https://www.newsunrising.org",
  logo: "/logos/nsr.png",
};

export const CLIENT_EXECUTIVE_DIRECTOR = {
  name: "Scott Wolovich",
  href: "https://www.linkedin.com/in/scott-wolovich-91141033b/",
};

export const TEAM: TeamMember[] = [
  {
    name: 'Daniel "Ludo" DeAnda',
    href: "https://www.linkedin.com/in/danielchristiandeanda/",
    role: "Lead Engineer",
    portrait: "/case-studies/vibrant-grants/team/ludo.png",
    highlighted: true,
  },
  {
    name: "Soyon Kim",
    href: "https://www.linkedin.com/in/soyon-kim/",
    role: "Co-Lead Researcher and Designer",
    portrait: "/case-studies/vibrant-grants/team/soyon.png",
  },
  {
    name: "Anissa Patel",
    href: "https://www.linkedin.com/in/anissa-patel/",
    role: "Project Manager and Data Engineer",
    portrait: "/case-studies/vibrant-grants/team/anissa.png",
  },
  {
    name: "Priyal Shrivastava",
    href: "https://www.linkedin.com/in/priyalshri/",
    role: "Co-Lead Researcher and AI Strategist",
    portrait: "/case-studies/vibrant-grants/team/priyal.png",
  },
  {
    name: "Cameron Thompson",
    href: "https://www.linkedin.com/in/cameron-jaede-thompson/",
    role: "Co-Lead Designer",
    portrait: "/case-studies/vibrant-grants/team/cameron.png",
  },
];

export const SERVICES: Service[] = [
  {
    name: "Capacity Building",
    description: "Getting from an idea to a fully developed organization",
    icon: Sprout,
  },
  {
    name: "Accessible Funding",
    description: "Raising the capital necessary to deliver impact",
    icon: HandCoins,
  },
  {
    name: "Data and Advocacy",
    description:
      "Helping orgs leverage data to communicate their impact and value",
    icon: ChartColumn,
  },
];

// General order: outermost -> innermost
export const STAKEHOLDERS: Stakeholders = [
  "Community members",
  "All non-profits",
  "Client non-profits",
  "NSR",
];

export const PICTURES = {
  nsrTeam: {
    src: "/case-studies/vibrant-grants/photos/new-sun-rising-team.jpg",
    alt: "The New Sun Rising team cheering with their arms raised in front of an ivy-covered wall.",
    width: 2560,
    height: 1472,
  },
  dataFlowModel: {
    src: "/case-studies/vibrant-grants/diagrams/data-flow-model-simplified.png",
    alt: "A diagram in which 18 unlabeled data stores and processes are joined by a tangle of crisscrossing solid and dashed arrows.",
    width: 3384,
    height: 2436,
  },
  systemMappingFigurines: {
    src: "/case-studies/vibrant-grants/photos/system-mapping-figurines.jpg",
    alt: "Clay figurines on a wooden table. Their handwritten labels include “Hunter,” “Scott,” “Non Profit,” “Social Enterprise,” and “Vibrancy Portal.”",
    width: 4032,
    height: 3024,
  },
  systemMappingInProgress: {
    src: "/case-studies/vibrant-grants/photos/system-mapping-in-progress.jpg",
    alt: "A workshop participant placing a clay figurine on a paper-covered table among hand-drawn arrows, sticky notes, and markers.",
    width: 5712,
    height: 4284,
  },
  dendrogram: {
    src: "/case-studies/vibrant-grants/diagrams/dendrogram-mini.png",
    alt: "A dendrogram in which six color-coded clusters of concepts merge at levels of consensus that range from 100% down to 50%.",
    width: 1352,
    height: 1212,
  },
  usabilityTesting: {
    src: "/case-studies/vibrant-grants/diagrams/usability-testing.png",
    alt: "A screenshot of NSR’s Vibrancy Portal on which parts of the interface are annotated with the questions “Noticeable?”, “Known to users?”, “Meaningful?”, “Helpful?”, and “Important?”",
    width: 1703,
    height: 1471,
  },
  nonProfitLeaders: {
    src: "/case-studies/vibrant-grants/photos/non-profit-leaders.jpg",
    alt: "Three masked volunteers portioning pasta into takeout containers at a long table.",
    width: 1920,
    height: 2560,
  },
  ingestionMechanism: {
    src: "/case-studies/vibrant-grants/diagrams/ingestion-mechanism.png",
    alt: "A flowchart in which a list of grant hub URLs feeds an algorithmic web scraper, whose output passes through an AI-powered grant parser and into the Vibrant Grants database.",
    width: 1384,
    height: 1288,
  },
} satisfies Record<string, Picture>;

export const CLIENT_NON_PROFIT_PHOTOS: ProjectPhoto[] = [
  {
    src: "/case-studies/vibrant-grants/photos/client-non-profits-001.png",
    alt: "Four children crouching around a tree stump that holds a pile of colorful beads.",
    width: 1458,
    height: 1084,
    caption: "Art in the Garden",
    href: "https://www.newsunrising.org/project/art-in-the-garden/",
  },
  {
    src: "/case-studies/vibrant-grants/photos/client-non-profits-002.jpg",
    alt: "A packed room of people seated at round tables beneath screens that read “Who is in the room?”",
    width: 2560,
    height: 1920,
    caption: "Millvale Food + Energy Hub",
    href: "https://www.newsunrising.org/project/millvale-food-and-energy-hub/",
  },
  {
    src: "/case-studies/vibrant-grants/photos/client-non-profits-003.jpg",
    alt: "A large room whose floor is covered in rows of packed brown paper bags.",
    width: 2016,
    height: 1512,
    caption: "Millvale Food + Energy Hub",
    href: "https://www.newsunrising.org/project/millvale-food-and-energy-hub/",
  },
  {
    src: "/case-studies/vibrant-grants/photos/client-non-profits-004.jpg",
    alt: "Three people posing with a painting of raised fists in many skin tones above a yellow bridge.",
    width: 1169,
    height: 894,
    caption: "Building Bridges Day",
    href: "https://www.newsunrising.org/project/building-bridges-day/",
  },
  {
    src: "/case-studies/vibrant-grants/photos/client-non-profits-005.jpg",
    alt: "Neighbors sharing coffee and doughnuts around a table in a colorful café.",
    width: 2048,
    height: 1536,
    caption: "Arts Excursions Unlimited",
    href: "https://www.newsunrising.org/project/arts-excursions-unlimited/",
  },
];

export const OTHER_RESEARCH_ACTIVITIES: ResearchActivity[] = [
  {
    label: "Directed storytelling",
    href: "https://www.youtube.com/watch?v=x8OJd4tpMoM",
  },
  {
    label: "MoSCoW analysis",
    href: "https://en.wikipedia.org/wiki/MoSCoW_method",
  },
  {
    label: "Mixed-methods survey",
    href: "https://www.nngroup.com/articles/mixed-methods-research/",
  },
  {
    label: "Speed dating",
    href: "https://www.designreference.xyz/ux-methods/ideation/speed-dating",
  },
  { label: "Co-design", href: "https://ixdf.org/literature/topics/codesign" },
  {
    label: "Concept testing",
    href: "https://maze.co/guides/concept-testing/",
  },
];

// One image per page of the PDF linked from the caption of the fan
// (i.e., `GRANT_OPPORTUNITY_HREF`), in order from first to last
export const GRANT_OPPORTUNITY_PAGES = Array.from(
  { length: 16 },
  (_, i) =>
    `/case-studies/vibrant-grants/grant-pages/page-${String(i + 1).padStart(2, "0")}.png`,
);

export const GRANT_OPPORTUNITY_HREF =
  "https://simpler.grants.gov/opportunity/bd1b6f4b-400a-451b-9af9-14b572457e6f";

// The amount due on each receipt is the sum of its line items
export const RECEIPTS: Receipt[] = [
  {
    title: "Free Trial",
    subtitle: "New, specialized tool",
    items: [
      { label: "Read comparison articles", hours: 0.75 },
      { label: "Compare pricing options", hours: 0.25 },
      { label: "Watch tutorial videos", hours: 1 },
      { label: "Import and organize data", hours: 1.5 },
      { label: "Migrate workflows", hours: 2 },
      { label: "Re-train volunteers", hours: 2 },
    ],
  },
  {
    title: "Existing Tool",
    subtitle: "Old, general-purpose tool",
    items: [{ label: "Click to open", hours: 0 }],
  },
];

// Listed in the order in which the stages of the grant lifecycle occur
export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "find-relevant-grants",
    title: "Find Relevant Grants",
    features: [
      {
        title: "Multi-Modal Ingestion",
        description: (
          <>
            Despite how unstructured the grant ecosystem often is, Vibrant
            Grants can <strong>source grant opportunities automatically</strong>{" "}
            thanks to a novel ingestion mechanism that leverages both a
            deterministic web scraper and an asynchronous, AI-powered data
            extraction workload.
          </>
        ),
        media: { kind: "picture", picture: PICTURES.ingestionMechanism },
      },
      {
        title: "Holistic Relevance Assessments",
        description: (
          <>
            Vibrant Grants <strong>ranks search results by relevance</strong>{" "}
            using a specially designed formula that accounts for 13 heuristic
            factors and features 21 fine-tunable hyperparameters.
          </>
        ),
        media: {
          kind: "video",
          src: "/case-studies/vibrant-grants/demos/search.webm",
        },
      },
    ],
  },
  {
    id: "weave-data-into-applications",
    title: "Weave Data into Applications",
    features: [
      {
        title: "Leverage Existing Sources",
        description: (
          <>
            Vibrant Grants <strong>intelligently surfaces relevant data</strong>{" "}
            from NSR&apos;s existing digital services and any additional sources
            that users supply to it.
          </>
        ),
        media: {
          kind: "video",
          src: "/case-studies/vibrant-grants/demos/sources.webm",
        },
      },
      {
        title: "Generate Step-by-Step Guidance",
        description: (
          <>
            Vibrant Grants leverages AI to{" "}
            <strong>
              help qualitative thinkers like non-profit leaders understand
              quantitative data
            </strong>
            , contextualize it, and apply it to prove their potential as
            grantees.
          </>
        ),
        media: {
          kind: "video",
          src: "/case-studies/vibrant-grants/demos/analysis.webm",
        },
      },
      {
        title: "Leave the Writing to the Experts",
        description: (
          <>
            People who are as community-driven as non-profit leaders are
            exceptional storytellers. Generating grant applications for them
            would worsen the quality of the writing, make mistakes more likely,
            and increase operating costs, so{" "}
            <strong>we deliberately chose not to</strong>.
          </>
        ),
        media: {
          kind: "video",
          src: "/case-studies/vibrant-grants/demos/no-writing.webm",
        },
      },
    ],
  },
  {
    id: "prove-impact-in-reports",
    title: "Prove Impact in Reports",
    features: [
      {
        title: "Conversational Data Gathering",
        description: (
          <>
            As qualitative thinkers, non-profit leaders may not always recognize
            when or what quantitative data might be useful. Vibrant Grants helps
            by{" "}
            <strong>
              converting that analytical question into an AI-driven
              conversational interaction
            </strong>{" "}
            that better aligns with how non-profit leaders actually think.
          </>
        ),
        media: {
          kind: "video",
          src: "/case-studies/vibrant-grants/demos/conversation.webm",
        },
      },
    ],
  },
];

// Quoted from NSR staff and acceptance testing participants;
// bracketed text marks editorial changes
export const TESTIMONIALS = [
  "[The interface is] not too much for my brain and not overwhelming.",
  "The plain[-]language [analysis] is great! This is where we see a lot of people struggle.",
  "Everything seems practical and educational.",
  "This makes me really excited!",
  "This is all amazing! Who would’ve thought grants could be exciting[?]",
  "This is awesome! I can already see the increase in grant apps going out!",
];

export const EXECUTIVE_DIRECTOR_TESTIMONIAL =
  "The UI here can help us set more modern, more accessible, cleaner ways for the information to be presented on the portal.";
