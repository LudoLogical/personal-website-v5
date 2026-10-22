import {
  BookOpenText,
  ChartNetwork,
  Database,
  FlaskConical,
  HandHelping,
  Network,
  PenTool,
  Presentation,
  Puzzle,
  ScanSearch,
  Server,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { FaAws, FaJava } from "react-icons/fa6";
import {
  SiAngular,
  SiClaude,
  SiCss,
  SiFigma,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiJira,
  SiNextdotjs,
  SiNotion,
  SiPython,
  SiReact,
  SiTypescript,
} from "react-icons/si";
import ExternalLink from "@/components/ExternalLink";
import type { Education, Experience, Recognition, Skill } from "./types";

// Every skill, keyed by the ID with which experiences refer to it.
// Each group lists its skills in the order in which they're written here
const skillsById = {
  // Engineering
  react: {
    name: "React",
    icon: SiReact,
    group: "Engineering",
    featured: true,
    highlighted: true,
  },
  nextjs: {
    name: "Next.js",
    icon: SiNextdotjs,
    group: "Engineering",
    featured: true,
  },
  typescript: {
    name: "TypeScript",
    icon: SiTypescript,
    group: "Engineering",
    featured: true,
  },
  javascript: {
    name: "JavaScript",
    icon: SiJavascript,
    group: "Engineering",
    featured: true,
  },
  java: { name: "Java", icon: FaJava, group: "Engineering", featured: true },
  python: {
    name: "Python",
    icon: SiPython,
    group: "Engineering",
    featured: true,
  },
  angularjs: { name: "Angular.js", icon: SiAngular, group: "Engineering" },
  restApis: { name: "REST APIs", icon: Server, group: "Engineering" },
  automatedTesting: {
    name: "Automated Testing",
    icon: FlaskConical,
    group: "Engineering",
  },
  dataModeling: { name: "Data Modeling", icon: Database, group: "Engineering" },
  networkAnalysis: {
    name: "Network Analysis",
    icon: ChartNetwork,
    group: "Engineering",
  },
  html: { name: "HTML", icon: SiHtml5, group: "Engineering" },
  css: { name: "CSS", icon: SiCss, group: "Engineering" },

  // Tools
  figma: {
    name: "Figma",
    icon: SiFigma,
    group: "Tools",
    featured: true,
    highlighted: true,
  },
  notion: { name: "Notion", icon: SiNotion, group: "Tools", featured: true },
  github: { name: "GitHub", icon: SiGithub, group: "Tools", featured: true },
  jira: { name: "Jira", icon: SiJira, group: "Tools", featured: true },
  claudeCode: { name: "Claude Code", icon: SiClaude, group: "Tools" },
  aws: { name: "AWS", icon: FaAws, group: "Tools" },

  // Practices
  informationArchitecture: {
    name: "Information Architecture",
    icon: Network,
    group: "Practices",
    featured: true,
    highlighted: true,
  },
  diagramming: {
    name: "Diagramming",
    icon: Workflow,
    group: "Practices",
    featured: true,
  },
  documentation: {
    name: "Documentation",
    icon: BookOpenText,
    group: "Practices",
    featured: true,
  },
  problemSolving: {
    name: "Problem Solving",
    icon: Puzzle,
    group: "Practices",
    featured: true,
  },
  mentorship: {
    name: "Mentorship",
    icon: HandHelping,
    group: "Practices",
    featured: true,
  },
  teamLeadership: { name: "Team Leadership", icon: Users, group: "Practices" },
  publicSpeaking: {
    name: "Public Speaking",
    icon: Presentation,
    group: "Practices",
  },

  // Design
  aiInteractionDesign: {
    name: "AI Interaction Design",
    icon: Sparkles,
    group: "Design",
    featured: true,
    highlighted: true,
  },
  uiUxDesign: { name: "UI/UX Design", icon: PenTool, group: "Design" },
  userResearch: { name: "User Research", icon: ScanSearch, group: "Design" },
} satisfies Record<string, Skill>;

export type SkillID = keyof typeof skillsById;

// Widened so that every skill can be read as a Skill (with all optional keys)
export const skills: Record<SkillID, Skill> = skillsById;

export const experience: Experience[] = [
  {
    role: "Director of Student Experience",
    organization: {
      name: "CodeDay",
      href: "https://www.codeday.org",
      logo: "/logos/codeday.png",
    },
    location: "Seattle, Washington",
    isRemote: true,
    start: "2025-08",
    formerRoles: [
      {
        role: "Head of Software Engineering Education",
        start: "2024-12",
        end: "2025-08",
      },
      {
        role: "Consulting Software Engineer",
        start: "2023-10",
        end: "2024-12",
      },
    ],
    description: [
      "Manage, train, and hire for a team of 6 consulting software engineers",
      "Design, deliver, and maintain kickoff presentations for an internship-style program that have dramatically improved interns’ awareness of resources",
      "Conduct novel, federally-backed research on program outcomes",
      "Co-develop organizational strategies for AI use and alumni engagement",
      "Helped interns make 40+ code contributions to 10+ open-source projects",
      "Assisted interns with 100s of novel software engineering challenges by teaching them relevant skills",
    ],
    links: [{ label: "CodeDay Labs", href: "https://labs.codeday.org" }],
    skillIDs: [
      "teamLeadership",
      "mentorship",
      "publicSpeaking",
      "informationArchitecture",
      "problemSolving",
      "github",
    ],
    featured: true,
  },
  {
    role: "Lead Engineer",
    organization: {
      name: "New Sun Rising",
      href: "https://www.newsunrising.org",
      logo: "/logos/nsr.png",
    },
    context: (
      <ExternalLink
        kind="underline"
        href="https://hcii.cmu.edu/academics/mhci/capstone"
      >
        MHCI Capstone
      </ExternalLink>
    ),
    location: "Pittsburgh, Pennsylvania",
    start: "2026-01",
    end: "2026-07",
    description: [
      "Implemented a novel, AI-powered ingestion mechanism for a web application that helps non-profits find and win grant opportunities",
      "Developed a formula for assessing grant relevance based on 13 heuristic factors and controlled by 21 hyperparameters",
      "Architected a comprehensive data type schema to ensure code extensibility",
      "Leveraged Claude Code and other AI tools to accelerate development",
      "Supported numerous user research and UX design processes throughout",
    ],
    links: [
      {
        label: "Final prototype",
        href: "https://capstone-project-eight-pied.vercel.app",
      },
      {
        label: "Source code",
        href: "https://github.com/LudoLogical/capstone-project",
      },
      {
        label: "Relevance formula",
        href: "https://github.com/LudoLogical/capstone-project/blob/main/docs/RELEVANCE.md",
      },
    ],
    skillIDs: [
      "aiInteractionDesign",
      "react",
      "nextjs",
      "typescript",
      "dataModeling",
      "claudeCode",
      "userResearch",
      "uiUxDesign",
    ],
    featured: true,
  },
  {
    role: "Lead Front-End Engineer",
    organization: {
      name: "Nebula Labs",
      href: "https://www.utdnebula.com",
      logo: "/logos/nebula-labs.png",
    },
    location: "Richardson, Texas",
    start: "2023-01",
    end: "2023-05",
    description: [
      "Co-architected a novel account and identity access management system",
      "Designed UIs for two front-end microservices and implemented one of them",
    ],
    links: [
      {
        label: "Final prototype",
        href: "https://platform-liart-mu.vercel.app/",
      },
      {
        label: "Source code",
        href: "https://github.com/UTDNebula/platform",
      },
    ],
    skillIDs: ["react", "nextjs", "typescript", "uiUxDesign", "github"],
    featured: true,
  },
  {
    role: "Software Engineering Intern",
    organization: {
      name: "Cvent, Inc.",
      href: "https://www.cvent.com",
      logo: "/logos/cvent.png",
    },
    location: "Dallas, Texas",
    isRemote: true,
    start: "2022-06",
    end: "2022-08",
    description: [
      "Wrote 3 novel REST API endpoints and deployed them to production",
      "Authored 20+ unit tests, integration tests, and automation tests",
      "Reduced technical debt by investigating issues with several existing integration tests and presenting findings",
      "Improved internal documentation by correcting outdated information and creating new diagrams and resources",
    ],
    skillIDs: ["restApis", "automatedTesting", "documentation", "diagramming"],
    featured: true,
  },
  {
    role: "Software Engineering Intern",
    organization: {
      name: "Onfleet, Inc.",
      href: "https://onfleet.com",
      logo: "/logos/onfleet.png",
    },
    location: "San Francisco, California",
    isRemote: true,
    start: "2021-05",
    end: "2021-08",
    description: [
      "Fixed a bug in a software-as-a-service (SaaS) web application that caused phone numbers to be displayed incorrectly",
      "Migrated a complex Single-Page Application (SPA) from Angular.js to React and added dozens of unit tests",
    ],
    skillIDs: ["react", "angularjs", "javascript", "automatedTesting"],
    featured: true,
  },
  {
    role: "CS Researcher",
    organization: {
      name: "University of Texas at Dallas",
      href: "https://www.utdallas.edu",
      logo: "/logos/ut-dallas.png",
    },
    location: "Richardson, Texas",
    start: "2020-05",
    end: "2020-09",
    description: [
      "Analyzed a 3.7 million-edge network constructed from university enrollment data",
      "Investigated the effectiveness and disruptiveness of strategies for minimizing COVID-19 transmission rates",
      "Collaborated with 6 peers and an honors professor",
    ],
    links: [
      {
        label: "Research paper",
        href: "https://www.alphaxiv.org/abs/2104.01261",
      },
    ],
    skillIDs: ["networkAnalysis"],
  },
  {
    role: "Early Website Designer",
    // The company's domain (peoplesv.com) has since been parked
    organization: {
      name: "People at Silicon Valley",
      logo: "/logos/peoplesv.png",
    },
    location: "Milpitas, California",
    start: "2017-05",
    end: "2017-06",
    description: [
      "Constructed a template for the company’s new website alongside a small team and under the direction of its founder",
    ],
    links: [
      {
        label: "Website template",
        href: "https://anke-hao.github.io/PeopleSV/",
      },
      { label: "Source code", href: "https://github.com/anke-hao/PeopleSV" },
    ],
    skillIDs: ["html", "css", "uiUxDesign"],
  },
];

export const education: Education[] = [
  {
    degree: "Master of Human-Computer Interaction",
    href: "https://hcii.cmu.edu/academics/mhci",
    institution: {
      name: "Carnegie Mellon University",
      href: "https://www.cmu.edu",
      logo: "/logos/cmu.png",
    },
    start: "2025-08",
    end: "2026-07",
  },
  {
    degree: "B.S. in Computer Science",
    href: "https://cs.utdallas.edu",
    institution: {
      name: "University of Texas at Dallas",
      href: "https://www.utdallas.edu",
      logo: "/logos/ut-dallas.png",
    },
    start: "2019-08",
    end: "2023-05",
    description: (
      <>
        Graduated <em>summa cum laude</em> w/ additional major (
        <ExternalLink
          kind="underline"
          href="https://cs.utdallas.edu/education/computing-scholars-honors-program/"
        >
          CS²
        </ExternalLink>
        ) and university (
        <ExternalLink
          kind="underline"
          href="https://honors.utdallas.edu/collegium-v/"
        >
          Collegium V
        </ExternalLink>
        ) honors
      </>
    ),
  },
];

export const certifications: Recognition[] = [
  {
    title: "AWS Cloud Solutions Architect",
    href: "https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect",
    organization: {
      name: "Coursera",
      href: "https://www.coursera.org",
      logo: "/logos/coursera.png",
    },
    date: "2023-09-01",
  },
  {
    title: "Seal of Biliteracy in Spanish",
    href: "https://www.cde.ca.gov/sp/el/er/sealofbiliteracy.asp",
    organization: {
      name: "State of California",
      href: "https://www.ca.gov",
      logo: "/logos/california.png",
    },
    date: "2023-06-06",
  },
];

export const honors: Recognition[] = [
  {
    title: "Valedictorian",
    organization: {
      name: "Homestead High School",
      href: "https://hhs.fuhsd.org",
      logo: "/logos/homestead.png",
    },
    location: "Cupertino, California",
    date: "2023-06-06",
  },
  {
    title: "National Merit Scholar",
    organization: {
      name: "National Merit Scholarship Corporation (NMSC)",
      href: "https://www.nationalmerit.org",
      logo: "/logos/national-merit.png",
    },
    date: "2019-02",
  },
];
