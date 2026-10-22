import {
  BadgeCheck,
  Briefcase,
  Download,
  GraduationCap,
  Trophy,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import type { ComponentType, ReactNode } from "react";
import Expandable from "@/components/Expandable";
import ExternalLink from "@/components/ExternalLink";
import { OrgLogo, OrgName, SkillChip } from "./atoms";
import {
  type SkillId,
  certifications,
  education,
  experience,
  honors,
  skills,
} from "./content";
import { type Recognition, type Skill, skillGroups } from "./types";
import {
  EducationEntry,
  ExperienceEntry,
  Timeline,
  TimelineItem,
} from "./timelines";

export const metadata: Metadata = {
  title: 'Resume | Daniel "Ludo" DeAnda',
  // description: '', TODO
};

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
          href="/resume-daniel-ludo-deanda.pdf"
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
