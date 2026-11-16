import Image from "next/image";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import Logo from "@/components/Logo";
import { ClientLogo, Paragraph } from "./atoms";
import type {
  Client,
  Insight,
  Heading,
  ResearchMethod,
  SectionHeading,
  TeamMember,
} from "./types";

/**
 * Renders one labeled entry in a {@link ProjectSummary}.
 */
const Fact = ({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) => (
  <div className={className}>
    <dt className="mb-3 text-xs font-bold tracking-widest text-base-content/50 uppercase">
      {label}
    </dt>
    <dd>{children}</dd>
  </div>
);

export type ProjectSummaryProps = {
  /**
   * The {@link TeamMember}s who worked on the project,
   * in the order in which they are to be listed.
   *
   * Note: The first is visually emphasized.
   */
  team: TeamMember[];

  /**
   * The {@link Client} for which the project was carried out.
   */
  client: Client;

  /**
   * The span of time over which the project took place.
   */
  timeline: {
    /**
     * The month, in YYYY-MM format, in which the project began.
     */
    start: string;

    /**
     * The month, in YYYY-MM format, in which the project ended.
     */
    end: string;
  };

  /**
   * A summary of what the project ultimately achieved.
   */
  outcome: ReactNode;

  /**
   * Classes for the container `<dl>` of this {@link ProjectSummary}.
   */
  className?: string;
};

/**
 * Renders the key facts about the project that a case study presents: its
 * `team`, its {@link Client}, its `timeline`, and its `outcome`. On wide
 * viewports, the `team` fills a column to the left of the other facts.
 */
export const ProjectSummary = ({
  team,
  client,
  timeline: { start, end },
  outcome,
  className,
}: ProjectSummaryProps) => (
  // The last row absorbs the height left over by the team, which
  // keeps the facts beside it packed together at the top
  <dl
    className={twMerge(
      "grid gap-x-10 gap-y-8 md:grid-cols-2 md:grid-rows-[auto_auto_1fr]",
      className,
    )}
  >
    <Fact label="Team" className="md:row-span-3">
      <ul className="flex flex-col gap-4">
        {team.map(({ name, href, role, portrait }, i) => (
          <li
            key={href}
            className={twMerge(
              "flex items-center gap-4",
              i === 0 && "font-bold",
            )}
          >
            <div className="avatar">
              <div className="mask size-12 mask-squircle">
                <Image src={portrait} alt="" width={48} height={48} />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span>
                <ExternalLink kind="underline" href={href}>
                  {name}
                </ExternalLink>
              </span>
              <span
                className={twMerge("text-sm", i > 0 && "text-base-content/70")}
              >
                {role}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Fact>
    <Fact label="Client">
      <div className="flex items-center gap-3">
        <ClientLogo client={client} />
        <ExternalLink kind="underline" href={client.href}>
          {client.name}
        </ExternalLink>
      </div>
    </Fact>
    <Fact label="Timeline">
      <span className="tabular-nums">
        <time dateTime={start}>{start}</time> to{" "}
        <time dateTime={end}>{end}</time>
      </span>
    </Fact>
    <Fact label="Outcome">{outcome}</Fact>
  </dl>
);

export type SectionProps = {
  /**
   * The {@link SectionHeading} that labels this {@link Section}.
   */
  heading: SectionHeading;

  /**
   * The content of this {@link Section}.
   */
  children: ReactNode;
};

/**
 * Renders a top-level section of a case study, labeled by
 * the specified {@link SectionHeading} in the primary color.
 */
export const Section = ({ heading: { id, title }, children }: SectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="scroll-mt-28 border-base-content/10 py-12 not-first:border-t"
  >
    <h2
      id={`${id}-heading`}
      className="mb-8 text-2xl leading-tight font-bold text-primary sm:text-3xl"
    >
      {title}
    </h2>
    {children}
  </section>
);

export type SubsectionProps = {
  /**
   * The {@link Heading} that labels this {@link Subsection}.
   */
  heading: Heading;

  /**
   * The content of this {@link Subsection}.
   */
  children: ReactNode;
};

/**
 * Renders a subsection of a {@link Section}, labeled by the specified
 * {@link Heading}, whose title is marked by the arrow from the {@link Logo}
 * (in the secondary color). The arrowhead is vertically centered on the
 * first line of the title.
 */
export const Subsection = ({
  heading: { id, title },
  children,
}: SubsectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="flex scroll-mt-44 flex-col gap-10"
  >
    <h3
      id={`${id}-heading`}
      className="flex items-start gap-3 text-xl leading-snug font-bold"
    >
      {/* Cropped to the bounds of the arrow, the only part left visible,
          whose arrowhead is centered 16 of its 24 units (i.e., 0.8em) from
          the top and is thus raised to the middle of the capitals */}
      <Logo
        viewBox="4 9 18 24"
        className="mt-[calc(0.5cap-0.8em)] h-[1.2em] w-auto shrink-0 **:fill-secondary **:data-dot:hidden **:data-letter-d:hidden"
      />
      {/* Trimmed so that its top edge lies at the top of the capitals */}
      <span className="text-box-trim">{title}</span>
    </h3>
    {children}
  </section>
);

export type MethodItemProps = {
  /**
   * The {@link ResearchMethod} to be rendered in this {@link MethodItem}.
   */
  method: ResearchMethod;

  /**
   * `true` if this {@link MethodItem} should start
   * out open, `false` otherwise (and by default).
   */
  open?: boolean;

  /**
   * The content that this {@link MethodItem} reveals while it is open
   * (e.g., evidence of the {@link ResearchMethod} in use), which follows the
   * `purpose` of the {@link ResearchMethod} (if any).
   */
  children: ReactNode;
};

/**
 * Renders the specified {@link ResearchMethod} as an item in an accordion whose
 * content opens with the `purpose` of the {@link ResearchMethod} (if any). Opening
 * an item closes whichever other one on the page is open, but every item
 * can be closed at once.
 *
 * Note: This component is a daisyUI `join-item`, so its
 * parent is responsible for supplying `join join-vertical`.
 */
export const MethodItem = ({
  method: { name: title, purpose },
  open = false,
  children,
}: MethodItemProps) => (
  // Sharing a `name` is what makes the browser close the other items
  <details
    name="research-methods"
    open={open}
    className="collapse-arrow collapse join-item border border-base-content/10 bg-base-200"
  >
    <summary className="collapse-title">
      <h3 className="text-lg leading-snug font-semibold">{title}</h3>
    </summary>
    <div className="collapse-content pb-6">
      <div className="flex flex-col gap-6">
        {purpose && <Paragraph>{purpose}</Paragraph>}
        {children}
      </div>
    </div>
  </details>
);

export type FindingStatementProps = {
  /**
   * The {@link Insight} to be rendered in this {@link FindingStatement}.
   */
  finding: Insight;
};

/**
 * Renders the statement of the specified {@link Insight}
 * above the paragraph that elaborates on it.
 */
export const FindingStatement = ({
  finding: { headline: title, details: description },
}: FindingStatementProps) => (
  <div className="flex flex-col gap-3 border-s-2 border-secondary ps-5">
    <h3 className="text-xl leading-snug font-semibold text-balance">{title}</h3>
    <Paragraph>{description}</Paragraph>
  </div>
);
