import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Download,
  GraduationCap,
  MapPin,
  Trophy,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import Expandable from "@/components/Expandable";
import ExternalLink from "@/components/ExternalLink";
import {
  type SkillId,
  certifications,
  education,
  experience,
  honors,
  skills,
} from "./content";
import {
  type Education,
  type Experience,
  type Organization,
  type Recognition,
  type Skill,
  skillGroups,
} from "./types";

export const metadata: Metadata = {
  title: 'Resume | Daniel "Ludo" DeAnda',
  // description: '', TODO
};

/**
 * The print-ready version of this page (in public/), which is designed for
 * humans (rather than applicant tracking systems) to read.
 */
const RESUME_PDF_PATH = "/resume-daniel-ludo-deanda.pdf";

/**
 * Builds the labels for an Expandable's toggle button,
 * which is omitted if there's nothing extra to show.
 * @param extraCount the number of extra items
 * @param singular the noun for one item (e.g., "role")
 * @param plural the noun for several items (e.g., "roles")
 */
const expandableLabels = (
  extraCount: number,
  singular: string,
  plural: string,
) =>
  extraCount > 0
    ? {
        expand: `Show ${extraCount} more ${extraCount === 1 ? singular : plural}`,
        collapse: `Show fewer ${plural}`,
      }
    : undefined;

/**
 * Renders a span of time as on the PDF (e.g., "2025-08 to Present").
 */
const DateRange = ({
  start,
  end,
  className,
}: {
  start: string;
  end?: string;
  className?: string;
}) => (
  <span className={twMerge("whitespace-nowrap tabular-nums", className)}>
    <time dateTime={start}>{start}</time> to{" "}
    {end ? <time dateTime={end}>{end}</time> : "Present"}
  </span>
);

/**
 * Renders an organization's logo (or initials, if it has no logo) masked to
 * a squircle. Hidden from assistive technology since the organization's name
 * is always displayed alongside it.
 */
const OrgLogo = ({
  organization: { name, logo },
  className,
}: {
  organization: Organization;
  className?: string;
}) => (
  <div
    aria-hidden
    className={twMerge(
      "mask grid size-12 shrink-0 place-items-center bg-base-content/10 mask-squircle",
      className,
    )}
  >
    {logo ? (
      <Image
        src={logo}
        alt=""
        width={48}
        height={48}
        className="size-full object-cover"
      />
    ) : (
      <span className="text-sm font-bold text-base-content/60">
        {name
          .split(/\s+/)
          .slice(0, 2)
          .map((word) => word[0])
          .join("")}
      </span>
    )}
  </div>
);

/**
 * Renders an organization's name, linked to its website if it has one.
 */
const OrgName = ({
  organization: { name, href },
}: {
  organization: Organization;
}) =>
  href ? (
    <ExternalLink kind="underline" href={href}>
      {name}
    </ExternalLink>
  ) : (
    name
  );

/**
 * The classes that every rendition of a skill shares so that highlighted
 * skills look the same everywhere they appear.
 */
const skillChipClassName = ({ highlighted }: Skill) =>
  twMerge("badge gap-1.5 badge-soft", highlighted && "badge-primary");

/**
 * Renders the content of a skill's chip: its icon and its name
 * (which is marked as important if the skill is highlighted).
 */
const SkillChipContent = ({
  skill: { name, icon: Icon, highlighted },
}: {
  skill: Skill;
}) => (
  <>
    <Icon aria-hidden className="size-[1.1em] shrink-0" />
    {highlighted ? <strong className="font-semibold">{name}</strong> : name}
  </>
);

/**
 * Renders a skill as a static chip.
 */
const SkillChip = ({
  skill,
  className,
}: {
  skill: Skill;
  className?: string;
}) => (
  <span className={twMerge(skillChipClassName(skill), className)}>
    <SkillChipContent skill={skill} />
  </span>
);

/**
 * Renders links to case studies (on this website) and to other work products
 * (on other websites) as a row of buttons, with the case studies first.
 */
const WorkLinks = ({
  caseStudies = [],
  links = [],
}: Pick<Experience, "caseStudies" | "links">) =>
  caseStudies.length + links.length > 0 && (
    <ul
      aria-label="Case studies and work products"
      className="flex flex-wrap gap-2"
    >
      {caseStudies.map(({ title, href }) => (
        <li key={href}>
          <Link
            href={href}
            className="btn gap-1.5 btn-soft text-sm btn-primary btn-sm"
          >
            <BookOpen aria-hidden className="size-4" />
            {title}
          </Link>
        </li>
      ))}
      {links.map(({ label, href }) => (
        <li key={href}>
          <ExternalLink kind="button" href={href}>
            {label}
          </ExternalLink>
        </li>
      ))}
    </ul>
  );

/**
 * Renders a section of the resume. On wide viewports, its heading sits in a
 * column to the left of its content and sticks below the navigation bar.
 */
const Section = ({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: ReactNode;
}) => (
  // Scrolled into view with enough room above for the navigation bar
  <section
    id={id}
    aria-labelledby={`${id}-heading`}
    className="scroll-mt-32 border-t border-base-content/10 py-12 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-10"
  >
    <h2
      id={`${id}-heading`}
      className="mb-8 flex items-center gap-3 text-2xl font-bold motion-reduce:transition-none lg:sticky lg:top-[calc(var(--primary-nav-inset,0px)+(--spacing(12)))] lg:mb-0 lg:self-start lg:transition-[top] lg:duration-300 lg:ease-out"
    >
      <Icon aria-hidden className="size-6 shrink-0 text-secondary" />
      {title}
    </h2>
    <div className="min-w-0">{children}</div>
  </section>
);

/**
 * Renders a vertical timeline whose items are marked by organizations' logos.
 * Its items are spaced apart with a gap (rather than margins) so that hidden
 * items leave no space behind.
 */
const Timeline = ({ children }: { children: ReactNode }) => (
  <ol className="timeline timeline-vertical timeline-compact gap-10">
    {children}
  </ol>
);

/**
 * Renders an item of a Timeline. Its logo lines up with the top of its
 * content, and the line beneath the logo runs across the Timeline's gap to
 * the next visible item's logo (so the last item gets no line). If extra, the
 * item is hidden until its Expandable is expanded. If it's the last featured
 * item (i.e., every item after it is extra), its line is extra too, so that
 * the line always ends at the last visible item.
 */
const TimelineItem = ({
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

const ExperienceEntry = ({
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
    caseStudies,
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
    <WorkLinks caseStudies={caseStudies} links={links} />
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

const EducationEntry = ({
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
 * Renders certifications or honors as a grid of compact entries.
 */
const RecognitionList = ({ items }: { items: Recognition[] }) => (
  <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
    {items.map(({ title, href, organization, location, date }) => (
      <li key={title} className="flex gap-4">
        <OrgLogo organization={organization} className="size-10" />
        <div className="flex min-w-0 flex-col gap-0.5 text-sm text-base-content/70">
          <h3 className="text-base leading-snug font-bold text-base-content">
            {href ? (
              <ExternalLink kind="underline" href={href}>
                {title}
              </ExternalLink>
            ) : (
              title
            )}
          </h3>
          <span>
            <OrgName organization={organization} />
          </span>
          {location && <span>{location}</span>}
          <time dateTime={date} className="tabular-nums">
            {date}
          </time>
        </div>
      </li>
    ))}
  </ul>
);

const extraExperienceCount = experience.filter(
  ({ featured }) => !featured,
).length;

const lastFeaturedExperienceIndex = experience.findLastIndex(
  ({ featured }) => featured,
);

// Each group's skills, in order, along with their IDs
const skillEntries = Object.entries(skills) as [SkillId, Skill][];
const skillsByGroup = skillGroups.map((group) => ({
  group,
  entries: skillEntries.filter(([, skill]) => skill.group === group),
}));

const extraSkillCount = skillEntries.filter(
  ([, { featured }]) => !featured,
).length;

export default function Resume() {
  return (
    // Clears the navigation bar, which floats above the top of the page
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-36 pb-12">
      <header className="flex flex-col items-start gap-8 pb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-sm font-bold tracking-widest text-primary uppercase">
            Resume
          </p>
          <h1 className="text-3xl leading-tight font-bold xxs:text-4xl sm:text-5xl">
            Daniel <span className="text-primary">&ldquo;Ludo&rdquo;</span>{" "}
            DeAnda
          </h1>
          <p className="mt-3 text-lg text-base-content/70 sm:text-xl">
            <strong className="text-base-content">Software Engineer</strong>,
            Systems Thinker, Sense-Maker
          </p>
        </div>
        {/* A convenience rather than a call to action (since this page already
            has everything the PDF does), so it's styled like the page's other
            utility buttons */}
        <a
          href={RESUME_PDF_PATH}
          download
          className="btn shrink-0 gap-2 rounded-lg btn-soft"
        >
          <Download aria-hidden className="size-4" />
          Download PDF
        </a>
      </header>

      <Section id="experience" title="Experience" icon={Briefcase}>
        <Expandable
          labels={expandableLabels(extraExperienceCount, "role", "roles")}
          className="gap-6"
        >
          <Timeline>
            {experience.map((entry, i) => (
              <TimelineItem
                key={`${entry.organization.name} ${entry.start}`}
                organization={entry.organization}
                extra={!entry.featured}
                lastFeatured={i === lastFeaturedExperienceIndex}
                last={i === experience.length - 1}
              >
                <ExperienceEntry entry={entry} />
              </TimelineItem>
            ))}
          </Timeline>
        </Expandable>
      </Section>

      <Section id="education" title="Education" icon={GraduationCap}>
        <Timeline>
          {education.map((entry, i) => (
            <TimelineItem
              key={`${entry.institution.name} ${entry.start}`}
              organization={entry.institution}
              last={i === education.length - 1}
            >
              <EducationEntry entry={entry} />
            </TimelineItem>
          ))}
        </Timeline>
      </Section>

      <Section id="skills" title="Skills" icon={Wrench}>
        <Expandable
          labels={expandableLabels(extraSkillCount, "skill", "skills")}
          className="gap-8"
        >
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {skillsByGroup.map(
              ({ group, entries }) =>
                entries.length > 0 && (
                  // A group with no featured skills is extra in its entirety
                  <div
                    key={group}
                    data-extra={
                      !entries.some(([, { featured }]) => featured) || undefined
                    }
                  >
                    <h3 className="mb-3 text-xs font-bold tracking-widest text-base-content/50 uppercase">
                      {group}
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {entries.map(([id, skill]) => (
                        <li key={id} data-extra={!skill.featured || undefined}>
                          <SkillChip skill={skill} className="badge-lg" />
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
            )}
          </div>
        </Expandable>
      </Section>

      <Section id="certifications" title="Certifications" icon={BadgeCheck}>
        <RecognitionList items={certifications} />
      </Section>

      <Section id="honors" title="Honors" icon={Trophy}>
        <RecognitionList items={honors} />
      </Section>
    </main>
  );
}
