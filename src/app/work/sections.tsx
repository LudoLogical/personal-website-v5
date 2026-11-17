import Image from "next/image";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import Logo from "@/components/Logo";
import { ClientLogo, Paragraph } from "./atoms";
import type {
  Client,
  Heading,
  Insight,
  ResearchMethod,
  SectionHeading,
  TeamMember,
} from "./types";

/**
 * Renders a single, labeled item in a {@link CaseStudySummary}.
 */
const CaseStudySummaryItem = ({
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

export type CaseStudySummaryProps = {
  /**
   * The {@link TeamMember}s who worked on the project/product presented
   * in this case study, in the order in which they are to be listed.
   *
   * Note: The first {@link TeamMember} should always be me!
   */
  team: TeamMember[];

  /**
   * The {@link Client} for which the project/product
   * presented in this case study was conducted/created.
   */
  client: Client;

  /**
   * The span of time over which the project/product
   * presented in this case study was conducted/created.
   */
  timeline: {
    /**
     * The month, in YYYY-MM format, in which work on the
     * project/product presented in this case study began.
     */
    start: string;

    /**
     * The month, in YYYY-MM format, in which work on the
     * project/product presented in this case study ended.
     */
    end: string;
  };

  /**
   * A summary of what the project/product presented
   * in this case study ultimately achieved.
   */
  outcome: ReactNode;

  /**
   * Classes for the container `<dl>` of this {@link CaseStudySummary}.
   */
  className?: string;
};

/**
 * Renders the following basic information about a case study: its `team`,
 * its {@link Client}, its `timeline`, and its `outcome`. On wide viewports,
 * the `team` appears in its own column to the left of the other information;
 * on narrow ones, all of the information appears in a single column and in
 * the order established above.
 */
export const CaseStudySummary = ({
  team,
  client,
  timeline: { start, end },
  outcome,
  className,
}: CaseStudySummaryProps) => (
  <dl
    className={twMerge(
      "grid gap-x-10 gap-y-8 md:grid-cols-2 md:grid-rows-[auto_auto_1fr]",
      className,
    )}
  >
    <CaseStudySummaryItem label="Team" className="md:row-span-3">
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
    </CaseStudySummaryItem>
    <CaseStudySummaryItem label="Client">
      <div className="flex items-center gap-3">
        <ClientLogo client={client} />
        <ExternalLink kind="underline" href={client.href}>
          {client.name}
        </ExternalLink>
      </div>
    </CaseStudySummaryItem>
    <CaseStudySummaryItem label="Timeline">
      <span className="tabular-nums">
        <time dateTime={start}>{start}</time> to{" "}
        <time dateTime={end}>{end}</time>
      </span>
    </CaseStudySummaryItem>
    <CaseStudySummaryItem label="Outcome">{outcome}</CaseStudySummaryItem>
  </dl>
);

export type SectionProps = {
  /**
   * The {@link SectionHeading} that labels this {@link Section}.
   */
  heading: SectionHeading;

  /**
   * The content of this {@link Section},
   * which may include one or more {@link Subsection}s.
   */
  children: ReactNode;
};

/**
 * Renders a top-level section of a case study, labeled by
 * the specified {@link SectionHeading} in the primary color.
 */
export const Section = ({ heading: { id, label }, children }: SectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="scroll-mt-28 border-base-content/10 py-12 not-first:border-t"
  >
    <h2
      id={`${id}-heading`}
      className="mb-8 text-2xl leading-tight font-bold text-primary sm:text-3xl"
    >
      {label}
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
   * The content of this {@link Subsection},
   * which should not contain any nested {@link Subsection}s.
   */
  children: ReactNode;
};

/**
 * Renders a subsection of a {@link Section}, labeled by the arrow
 * from the {@link Logo} (displayed in the secondary color) and the
 * specified {@link Heading}. The two elements are vertically aligned
 * such that arrowhead is vertically centered on the first line of
 * the {@link Heading.label}.
 */
export const Subsection = ({
  heading: { id, label: title },
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
      {/* The new `viewBox` crops the `Logo` to the bounds of the arrow;
          the margin aligns the center of the arrowhead with the middle of
          the (capital letter(s) in the) title */}
      {/* Math: `text-xl` yields a `font-size` of 20px, so the new `viewBox`
          is intrinsically 1.2em tall and the the center of the arrowhead is
          located 16 units -> 0.8em from the top */}
      <Logo
        viewBox="4 9 18 24"
        className="mt-[calc(0.5cap-0.8em)] h-[1.2em] w-auto shrink-0 **:fill-secondary **:data-dot:hidden **:data-letter-d:hidden"
      />
      {/* `text-box-trim` to clamp the top of the bounding
          box to the cap height of the first line of text */}
      <span className="text-box-trim">{title}</span>
    </h3>
    {children}
  </section>
);

export type ResearchMethodItemProps = {
  /**
   * The {@link ResearchMethod} to be
   * rendered in this {@link ResearchMethodItem}.
   */
  method: ResearchMethod;

  /**
   * `true` if this {@link ResearchMethodItem} should
   * start out open, `false` otherwise (and by default).
   */
  open?: boolean;

  /**
   * The content that this {@link ResearchMethodItem} reveals while it is open
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
export const ResearchMethodItem = ({
  method: { name: title, purpose },
  open = false,
  children,
}: ResearchMethodItemProps) => (
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
