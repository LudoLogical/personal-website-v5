import type { ComponentType, ReactNode } from "react";
import type { SkillId } from "./content";

/**
 * A company, school, or other organization.
 */
export type Organization = {
  name: string;

  /**
   * The organization's website.
   */
  href?: string;

  /**
   * The path (within public/) to the organization's logo, which is masked to a
   * squircle. For consistency, it should be a square image that's at least
   * 96px wide and fills its whole area (with its own background color, rather
   * than transparency). Displays the organization's initials if omitted.
   */
  logo?: string;
};

/**
 * The groups into which the skills are sorted, in the order they appear.
 */
export const skillGroups = [
  "Engineering",
  "Tools",
  "Practices",
  "Design",
] as const;

export type Skill = {
  name: string;

  /**
   * An icon that represents the skill (e.g., its logo, for a technology).
   */
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

  group: (typeof skillGroups)[number];

  /**
   * Whether the skill is visible in the Skills section without expanding it.
   */
  featured?: boolean;

  /**
   * Whether the skill is emphasized everywhere it appears (both in the Skills
   * section and in the Experience section). Should only be set for skills
   * that are also featured.
   */
  highlighted?: boolean;
};

/**
 * A role held at an organization.
 */
export type Experience = {
  role: string;
  organization: Organization;

  /**
   * The nature of the role (e.g., "MHCI Capstone"), which
   * appears in parentheses after the organization's name.
   */
  context?: ReactNode;

  location: string;
  start: string;

  /**
   * Omitted if the role is ongoing.
   */
  end?: string;

  /**
   * Roles previously held at the same organization, from most to least recent.
   */
  formerRoles?: { role: string; start: string; end: string }[];

  highlights: ReactNode[];

  /**
   * Publicly accessible work products (e.g., a live app or its source code).
   */
  links?: { label: string; href: string }[];

  /**
   * The skills that are most relevant to the role, in the order to display.
   */
  skills?: SkillId[];

  /**
   * Case studies of the role in the Work section of this website, each linked
   * by its path (e.g., "/work/vibrant-grants").
   */
  caseStudies?: { title: string; href: string }[];

  /**
   * Whether the role is visible in the Experience
   * section without expanding it.
   */
  featured?: boolean;
};

/**
 * A degree earned (or being earned) at a school.
 */
export type Education = {
  degree: string;

  /**
   * The page for the degree program.
   */
  href?: string;

  institution: Organization;
  start: string;

  /**
   * Omitted if the degree is still in progress.
   */
  end?: string;

  notes?: ReactNode;
};

/**
 * A certification or honor bestowed by an organization.
 */
export type Recognition = {
  title: string;

  /**
   * A page about the recognition itself (e.g., a credential's details).
   */
  href?: string;

  organization: Organization;
  location?: string;
  date: string;
};
