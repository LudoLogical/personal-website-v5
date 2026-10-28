import type { ComponentType, ReactNode } from "react";
import type { SkillID } from "./content";

/**
 * A company, non-profit, institution, or other group with which
 * an {@link Experience}, {@link Education}, or {@link Recognition}
 * may be affiliated.
 */
export type Organization = {
  /**
   * The name of this {@link Organization}.
   */
  name: string;

  /**
   * The website for this {@link Organization}.
   */
  href?: string;

  /**
   * The path (in `public/logos/`) to the logo for this {@link Organization}.
   * Expected to be a square image with a filled (i.e., not transparent)
   * background. If omitted, the initials of this {@link Organization}'s
   * name are used as a placeholder instead.
   */
  logo?: string;
};

/**
 * The groups into which {@link Skill}s
 * are sorted, listed in order of appearance.
 */
export const SKILL_GROUPS = [
  "Engineering",
  "Tools",
  "Practices",
  "Design",
] as const;

/**
 * A group into which {@link Skill}s can be sorted.
 */
export type SkillGroup = (typeof SKILL_GROUPS)[number];

/**
 * A competency that may or may not be
 * associated with one or more {@link Experience}s.
 */
export type Skill = {
  /**
   * The name of this {@link Skill}.
   */
  name: string;

  /**
   * An icon that represents this {@link Skill}
   * (e.g., the logo for a technology).
   */
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

  /**
   * The group to which this {@link Skill}
   * belongs and under which it will appear.
   */
  group: SkillGroup;

  /**
   * `true` if this {@link Skill} should always be visible in the "Skills"
   * section of `/resume`, `false` if it should only appear when that section
   * is expanded (and by default).
   */
  featured?: boolean;

  /**
   * `true` if this {@link Skill} should be visually emphasized
   * everywhere it appears (i.e., in both the "Skills" and "Experience"
   * sections), `false` otherwise (and by default). A {@link Skill} that
   * is `highlighted` should always also be `featured`.
   */
  highlighted?: boolean;
};

/**
 * One or more roles held contiguously
 * at or with a single {@link Organization}.
 */
export type Experience = {
  /**
   * The name of the most recently held role in this {@link Experience}.
   */
  role: string;

  /**
   * The {@link Organization} with which this {@link Experience} is associated.
   */
  organization: Organization;

  /**
   * Important contextual information about this {@link Experience};
   * appears in parentheses after the name of the {@link Organization}.
   */
  context?: ReactNode;

  /**
   * The city and state in which the {@link Organization}
   * associated with this {@link Experience} is/was located.
   */
  location: string;

  /**
   * `true` if this {@link Experience} was remote,
   * `false` otherwise (and by default).
   */
  isRemote?: boolean;

  /**
   * The month, in YYYY-MM format, in which the most
   * recently held role in this {@link Experience} began.
   */
  start: string;

  /**
   * The month, in YYYY-MM format, in which the most recently held role
   * in this {@link Experience} ended. Omitted if said role is ongoing.
   */
  end?: string;

  /**
   * The role(s) held prior to the most recently held role in this
   * {@link Experience} (if any), in order from most to least recent.
   */
  formerRoles?: {
    /**
     * The name of this formerly held role.
     */
    role: string;

    /**
     * The month, in YYYY-MM format,
     * in which this formerly held role began.
     */
    start: string;

    /**
     * The month, in YYYY-MM format,
     * in which this formerly held role ended.
     */
    end: string;
  }[];

  /**
   * One or more bullet points that outline
   * the work performed in this {@link Experience}.
   */
  description: ReactNode[];

  /**
   * Links to publicly accessible work products (e.g., a live app or
   * its source code) and case studies (located in /work and linked by
   * their relative paths) associated with this {@link Experience},
   * in the order in which they are to be displayed.
   */
  links?: { label: string; href: string }[];

  /**
   * The IDs of the {@link Skill}s that are most relevant to the role,
   * in the order in which they are to be displayed.
   */
  skillIDs?: SkillID[];

  /**
   * `true` if this {@link Experience} should always be visible in the
   * "Experience" section of `/resume`, `false` if it should only appear
   * when that section is expanded (and by default).
   */
  featured?: boolean;
};

/**
 * A degree earned (or currently being earned) at an academic institution.
 */
export type Education = {
  /**
   * The name of the degree that is the subject of this {@link Education}.
   */
  degree: string;

  /**
   * The webpage of the degree program that
   * is the subject of this {@link Education}.
   */
  href?: string;

  /**
   * The {@link Organization} at which this
   * {@link Education} was (or is being) pursued.
   */
  institution: Organization;

  /**
   * The month, in YYYY-MM format, in which
   * this {@link Education} was initiated.
   */
  start: string;

  /**
   * The month, in YYYY-MM format, in which this {@link Education}
   * was completed. Omitted if this {@link Education} is still in progress.
   */
  end?: string;

  /**
   * Additional information about this {@link Education}.
   */
  description?: ReactNode;
};

/**
 * A certification or honor bestowed by an {@link Organization}.
 */
export type Recognition = {
  /**
   * The name of this {@link Recognition}.
   */
  title: string;

  /**
   * A webpage about this {@link Recognition}
   * or containing proof of its receipt.
   */
  href?: string;

  /**
   * The {@link Organization} that bestowed this {@link Recognition}.
   */
  organization: Organization;

  /**
   * The city and state in which this
   * {@link Recognition} was bestowed, if relevant.
   */
  location?: string;

  /**
   * The date, in YYYY-MM-DD format, on which
   * this {@link Recognition} was bestowed.
   */
  date: string;
};
