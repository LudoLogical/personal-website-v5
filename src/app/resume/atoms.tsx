import Image from "next/image";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import type { Organization, Skill } from "./types";

/**
 * Renders an organization's logo (or initials, if it has no logo) masked to
 * a squircle. Hidden from assistive technology since the organization's name
 * is always displayed alongside it.
 */
export const OrgLogo = ({
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
export const OrgName = ({
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
 * Renders a span of time as on the PDF (e.g., "2025-08 to Present").
 */
export const DateRange = ({
  start,
  end,
}: {
  start: string;
  end?: string;
  className?: string;
}) => (
  <span className="text-sm whitespace-nowrap text-base-content/60 tabular-nums">
    <time dateTime={start}>{start}</time> to{" "}
    {end ? <time dateTime={end}>{end}</time> : "Present"}
  </span>
);

/**
 * Renders a skill as a static chip.
 */
export const SkillChip = ({
  skill,
  className,
}: {
  skill: Skill;
  className?: string;
}) => {
  const Icon = skill.icon;
  return (
    <span
      className={twMerge(
        "badge gap-1.5 badge-soft",
        skill.highlighted && "badge-primary",
        className,
      )}
    >
      <Icon aria-hidden className="size-[1.1em] shrink-0" />
      {skill.highlighted ? (
        <strong className="font-semibold">{skill.name}</strong>
      ) : (
        skill.name
      )}
    </span>
  );
};
