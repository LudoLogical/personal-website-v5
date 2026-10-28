import { BookOpen, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type Expandable from "@/components/Expandable";
import ExternalLink from "@/components/ExternalLink";
import { DateRange, OrgLogo, OrgName, SkillChip } from "./atoms";
import { SKILLS } from "./content";
import type { Education, Experience, Organization } from "./types";

/**
 * Renders the specified `title` to the left of
 * (or, on narrow viewports, above) the specified time span.
 */
const EntryHeader = ({
  title,
  start,
  end,
}: {
  title: ReactNode;
  start: string;
  end?: string;
}) => (
  <div className="flex flex-col gap-x-6 gap-y-0.5 sm:flex-row sm:items-baseline sm:justify-between">
    <h3 className="text-lg leading-snug font-bold">{title}</h3>
    <DateRange start={start} end={end} />
  </div>
);

export type ExperienceEntryProps = {
  /**
   * The {@link Experience} to be rendered in this {@link ExperienceEntry}.
   */
  entry: Experience;
};

/**
 * Renders the specified {@link Experience}
 * as the body of a {@link TimelineItem}.
 */
export const ExperienceEntry = ({
  entry: {
    role,
    organization,
    context,
    location,
    isRemote,
    start,
    end,
    formerRoles,
    description,
    links,
    skillIDs,
  },
}: ExperienceEntryProps) => (
  <article className="flex flex-col gap-4">
    <header>
      <EntryHeader
        title={
          <>
            {role} <span className="font-normal text-base-content/50">@</span>{" "}
            <OrgName organization={organization} />
            {context && <span className="font-normal"> ({context})</span>}
          </>
        }
        start={start}
        end={end}
      />
      <p className="mt-1 flex items-center gap-1.5 text-sm text-base-content/60">
        <MapPin aria-hidden className="size-3.5 shrink-0" />
        {isRemote ? `Remote (${location})` : location}
      </p>

      {formerRoles && (
        <ul className="mt-3 flex flex-col gap-1 border-s-2 border-base-content/10 ps-3 text-sm">
          {formerRoles.map((formerRole) => (
            <li
              key={formerRole.start}
              className="flex flex-col gap-x-6 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span>
                <em className="text-base-content/60">formerly</em>{" "}
                <span className="font-semibold">{formerRole.role}</span>
              </span>
              <DateRange start={formerRole.start} end={formerRole.end} />
            </li>
          ))}
        </ul>
      )}
    </header>

    <ul className="flex list-disc flex-col gap-1.5 ps-5 text-base-content/85 marker:text-base-content/30">
      {description.map((highlight, i) => (
        <li key={i}>{highlight}</li>
      ))}
    </ul>

    {links && links.length > 0 && (
      <ul
        aria-label="Case studies and work products"
        className="flex flex-wrap gap-2"
      >
        {links.map(({ label, href }) => (
          <li key={href}>
            {href.startsWith("/") ? (
              <Link
                href={href}
                className="btn gap-1.5 btn-soft text-sm btn-primary btn-sm"
              >
                <BookOpen aria-hidden className="size-4" />
                {label}
              </Link>
            ) : (
              <ExternalLink kind="button" href={href}>
                {label}
              </ExternalLink>
            )}
          </li>
        ))}
      </ul>
    )}

    {skillIDs && (
      <ul aria-label="Relevant skills" className="flex flex-wrap gap-1.5">
        {skillIDs.map((id) => (
          <li key={id}>
            <SkillChip skill={SKILLS[id]} />
          </li>
        ))}
      </ul>
    )}
  </article>
);

export type EducationEntryProps = {
  /**
   * The {@link Education} to be rendered in this {@link EducationEntry}.
   */
  entry: Education;
};

/**
 * Renders the specified {@link Education}
 * as the body of a {@link TimelineItem}.
 */
export const EducationEntry = ({
  entry: { degree, href, institution, start, end, description },
}: EducationEntryProps) => (
  <article>
    <EntryHeader
      title={
        href ? (
          <ExternalLink kind="underline" href={href}>
            {degree}
          </ExternalLink>
        ) : (
          degree
        )
      }
      start={start}
      end={end}
    />
    <p className="mt-1 text-base-content/70">
      <OrgName organization={institution} />
    </p>
    {description && <p className="mt-3 text-base-content/85">{description}</p>}
  </article>
);

export type TimelineItemProps = {
  /**
   * The {@link Organization} whose logo marks this {@link TimelineItem}.
   */
  organization: Organization;

  /**
   * `true` if this {@link TimelineItem} should only appear when the
   * {@link Expandable} containing it is expanded (i.e., if it should bear
   * the `data-extra` attribute), `false` otherwise (and by default).
   */
  extra?: boolean;

  /**
   * `true` if this is the last {@link TimelineItem} in its parent
   * {@link Timeline} that is not extra (i.e., visible while the
   * {@link Expandable} containing it is collapsed),
   * `false` otherwise (and by default).
   */
  lastFeatured?: boolean;

  /**
   * `true` if this is the last {@link TimelineItem} in its parent
   * {@link Timeline}, `false` otherwise (and by default).
   */
  last?: boolean;

  /**
   * The content of this {@link TimelineItem} (currently either
   * an {@link ExperienceEntry} or an {@link EducationEntry}).
   */
  children: ReactNode;
};

/**
 * Renders a single item in a {@link Timeline}.
 */
export const TimelineItem = ({
  organization,
  extra = false,
  lastFeatured = false,
  last = false,
  children,
}: TimelineItemProps) => (
  <li data-extra={extra || undefined} className="[--timeline-row-start:0]">
    <div className="timeline-middle">
      <OrgLogo organization={organization} className="size-10 sm:size-12" />
    </div>
    <div className="timeline-end m-0 ms-4 self-start justify-self-stretch sm:ms-6">
      {children}
    </div>
    {/* Extended by Timeline's `gap-10` (and aligned to the top of its
        flex row) so that it reaches the logo of the next `TimelineItem`.*/}
    {!last && (
      <hr
        // Need to hide the line if this is the last `TimelineItem` overall
        // *or* the last one visible while collapsed (i.e., `lastFeatured`)
        data-extra={lastFeatured || undefined}
        className="h-[calc(100%+(--spacing(10)))] w-0.5 self-start bg-base-content/10"
      />
    )}
  </li>
);

export type TimelineProps = {
  /**
   * The {@link TimelineItem}s that comprise this {@link Timeline}.
   */
  children: ReactNode;
};

/**
 * Renders a vertical timeline consisting of {@link TimelineItem}s marked by
 * {@link Organization}s' logos. Designed to be {@link Expandable}.
 */
export const Timeline = ({ children }: TimelineProps) => (
  // Use gap instead of margin so hidden `TimelineItem`s don't make extra space
  <ol className="timeline timeline-vertical timeline-compact gap-10">
    {children}
  </ol>
);
