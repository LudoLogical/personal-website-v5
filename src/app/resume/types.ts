import type { ComponentType, ReactNode } from "react";
import type { SkillID } from "./content";

/**
 * A company, non-profit, institution, or other group with which
 * an Experience, Education, or Recognition may be affiliated.
 */
export type Organization = {
  /**
   * The name of this Oragnization.
   */
  name: string;

  /**
   * The website for this Organization.
   */
  href?: string;

  /**
   * The path (within public/logos/) to the Logo for this Organization.
   * Expected to be a square image with a filled (i.e., not transparent)
   * background. If omitted, the initials of this Organization's name are
   * used as a placeholder instead.
   */
  logo?: string;
};

/**
 * The groups into which Skills are sorted, listed in order of appearance.
 */
export const skillGroups = [
  "Engineering",
  "Tools",
  "Practices",
  "Design",
] as const;

/**
 * A group into which Skills can be sorted.
 */
export type SkillGroup = (typeof skillGroups)[number];

/**
 * A competency that may or may not be associated with one or more Experiences.
 */
export type Skill = {
  /**
   * The name of this Skill.
   */
  name: string;

  /**
   * An icon that represents this Skill (e.g., the logo for a technology).
   */
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

  /**
   * The group to which this Skill belongs and under which it will appear.
   */
  group: SkillGroup;

  /**
   * True if this Skill should always be visible in the "Skills" section of
   * /resume, false if it should only appear when that section is expanded.
   */
  featured?: boolean;

  /**
   * True if this Skill should be visually emphasized emphasized everywhere
   * it appears (i.e., in both the "Skills" and "Experience" sections),
   * false otherwise. Highlighted Skills should always also be featured.
   */
  highlighted?: boolean;
};

/**
 * One or more roles held contiguously at or with a single Organization.
 */
export type Experience = {
  /**
   * The name of the most recently held role in this Experience.
   */
  role: string;

  /**
   * The Organization with which this Experience is associated.
   */
  organization: Organization;

  /**
   * Important contextual information about this Experience;
   * appears in parentheses after the name of the Organization.
   */
  context?: ReactNode;

  /**
   * The city and state in which the Organization
   * associated with this Experience is/was located.
   */
  location: string;

  /**
   * True if this Experience was remote, false otherwise.
   */
  isRemote?: boolean;

  /**
   * The month, in YYYY-MM format, in which the most
   * recently held role in this Experience began.
   */
  start: string;

  /**
   * The month, in YYYY-MM format, in which the most recently held
   * role in this Experience ended. Omitted if said role is ongoing.
   */
  end?: string;

  /**
   * The role(s) held prior to the most recently held role in
   * this Experience (if any), in order from most to least recent.
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
   * the work performed in this Experience.
   */
  description: ReactNode[];

  /**
   * Links to publicly accessible work products (e.g., a live app or
   * its source code) and case studies (located in /work and linked by
   * their relative paths) associated with this Experience, in the order
   * in which they are to be displayed.
   */
  links?: { label: string; href: string }[];

  /**
   * The IDs of the Skills that are most relevant to the role,
   * in the order in which they are to be displayed.
   */
  skillIDs?: SkillID[];

  /**
   * True if this Experience should always be visible in the "Experience"
   * section of /resume, false if it should only appear when that section
   * is expanded.
   */
  featured?: boolean;
};

/**
 * A degree earned (or currently being earned) at an academic institution.
 */
export type Education = {
  /**
   * The name of the degree that is the subject of this Education.
   */
  degree: string;

  /**
   * The webpage of the degree program that is the subject of this Education.
   */
  href?: string;

  /**
   * The Organization at which this Education was (or is being) pursued.
   */
  institution: Organization;

  /**
   * The month, in YYYY-MM format, in which this Education was initiated.
   */
  start: string;

  /**
   * The month, in YYYY-MM format, in which this Education was completed.
   * Omitted if this Education is still in progress.
   */
  end?: string;

  /**
   * Additional information about this Education.
   */
  description?: ReactNode;
};

/**
 * A certification or honor bestowed by an Organization.
 */
export type Recognition = {
  /**
   * The name of this Recognition.
   */
  title: string;

  /**
   * A webpage about this Recognition or containing proof of its receipt.
   */
  href?: string;

  /**
   * The Organization that bestowed this Recognition.
   */
  organization: Organization;

  /**
   * The city and state in which this Recognition was bestowed, if relevant.
   */
  location?: string;

  /**
   * The date, in YYYY-MM-DD format, on which this Recognition was bestowed.
   */
  date: string;
};
