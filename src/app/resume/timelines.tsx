import { MapPin, BookOpen, Link } from "lucide-react";
import type { ReactNode } from "react";
import ExternalLink from "@/components/ExternalLink";
import { OrgLogo, DateRange, OrgName, SkillChip } from "./atoms";
import { skills } from "./content";
import type { Education, Experience, Organization } from "./types";

/**
 * Renders a heading row with a title on the left and a span of time on the
 * right (or below, on narrow viewports), like each entry on the PDF.
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
    <DateRange
      start={start}
      end={end}
      className="text-sm text-base-content/60"
    />
  </div>
);

export const ExperienceEntry = ({
  entry: {
    role,
    organization,
    context,
    location,
    start,
    end,
    formerRoles,
    highlights,
    links,
    skills: skillIds,
  },
}: {
  entry: Experience;
}) => (
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
        {location}
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
              <DateRange
                start={formerRole.start}
                end={formerRole.end}
                className="text-base-content/60"
              />
            </li>
          ))}
        </ul>
      )}
    </header>
    <ul className="flex list-disc flex-col gap-1.5 ps-5 text-base-content/85 marker:text-base-content/30">
      {highlights.map((highlight, i) => (
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
    {skillIds && (
      <ul aria-label="Relevant skills" className="flex flex-wrap gap-1.5">
        {skillIds.map((id) => (
          <li key={id}>
            <SkillChip skill={skills[id]} />
          </li>
        ))}
      </ul>
    )}
  </article>
);

export const EducationEntry = ({
  entry: { degree, href, institution, start, end, notes },
}: {
  entry: Education;
}) => (
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
    {notes && <p className="mt-3 text-base-content/85">{notes}</p>}
  </article>
);

/**
 * Renders an item of a Timeline. Its logo lines up with the top of its
 * content, and the line beneath the logo runs across the Timeline's gap to
 * the next visible item's logo (so the last item gets no line). If extra, the
 * item is hidden until its Expandable is expanded. If it's the last featured
 * item (i.e., every item after it is extra), its line is extra too, so that
 * the line always ends at the last visible item.
 */
export const TimelineItem = ({
  organization,
  extra = false,
  lastFeatured = false,
  last = false,
  children,
}: {
  organization: Organization;
  extra?: boolean;
  lastFeatured?: boolean;
  last?: boolean;
  children: ReactNode;
}) => (
  <li data-extra={extra || undefined} className="[--timeline-row-start:0]">
    <div className="timeline-middle">
      <OrgLogo organization={organization} className="size-10 sm:size-12" />
    </div>
    <div className="timeline-end m-0 ms-4 self-start justify-self-stretch sm:ms-6">
      {children}
    </div>
    {/* Extended by the Timeline's gap-10 to meet the next item, and aligned
        to the top of its row so that the extension isn't split between its
        top and bottom (since daisyUI centers each item's contents) */}
    {!last && (
      <hr
        data-extra={lastFeatured || undefined}
        className="h-[calc(100%+(--spacing(10)))] w-0.5 self-start bg-base-content/10"
      />
    )}
  </li>
);

/**
 * Renders a vertical timeline whose items are marked by organizations' logos.
 * Its items are spaced apart with a gap (rather than margins) so that hidden
 * items leave no space behind.
 */
export const Timeline = ({ children }: { children: ReactNode }) => (
  <ol className="timeline timeline-vertical timeline-compact gap-10">
    {children}
  </ol>
);
