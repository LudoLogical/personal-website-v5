import Image from "next/image";
import { twMerge } from "tailwind-merge";
import ExternalLink from "@/components/ExternalLink";
import type { Organization, Skill } from "./types";

export type OrgLogoProps = {
  /**
   * The {@link Organization} whose logo is
   * to be rendered in this {@link OrgLogo}.
   */
  organization: Organization;

  /**
   * Classes for the container `<div>` of this {@link OrgLogo}.
   * Used to set its size.
   */
  className?: string;
};

/**
 * Renders the logo (or initials, if no logo exists) of the specified
 * {@link Organization} in a squircle. Hidden from ATs because the name
 * of the {@link Organization} should always be displayed alongside it.
 */
export const OrgLogo = ({
  organization: { name, logo },
  className,
}: OrgLogoProps) => (
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

export type OrgNameProps = {
  /**
   * The {@link Organization} whose name is
   * to be rendered in this {@link OrgName}.
   */
  organization: Organization;
};

/**
 * Renders the name of the specified {@link Organization},
 * linked to its website if it has one.
 */
export const OrgName = ({ organization: { name, href } }: OrgNameProps) =>
  href ? (
    <ExternalLink kind="underline" href={href}>
      {name}
    </ExternalLink>
  ) : (
    name
  );

export type DateRangeProps = {
  /**
   * The date/month on/during which this {@link DateRange} should start.
   */
  start: string;

  /**
   * The date/month on/during which this {@link DateRange} should end.
   * Defaults to "Present" if omitted.
   */
  end?: string;
};

/**
 * Renders the duration defined by the specified `start` and `end` dates/months.
 */
export const DateRange = ({ start, end }: DateRangeProps) => (
  <span className="text-sm whitespace-nowrap text-base-content/60 tabular-nums">
    <time dateTime={start}>{start}</time> to{" "}
    {end ? <time dateTime={end}>{end}</time> : "Present"}
  </span>
);

export type SkillChipProps = {
  /**
   * The {@link Skill} to be rendered by this {@link SkillChip}.
   */
  skill: Skill;

  /**
   * `true` if this {@link SkillChip} should be rendered
   * as `badge-lg`, `false` otherwise (and by default).
   */
  large?: boolean;
};

/**
 * Renders the specified {@link Skill} as a chip.
 */
export const SkillChip = ({ skill, large }: SkillChipProps) => {
  const Icon = skill.icon;
  return (
    <span
      className={twMerge(
        "badge gap-1.5 badge-soft",
        skill.highlighted && "badge-primary",
        large && "badge-lg",
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
