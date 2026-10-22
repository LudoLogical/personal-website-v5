import type { ComponentType, ReactNode } from "react";
import type { SkillId } from "./content";

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

  group: (typeof skillGroups)[number];

  /**
   * True if this Skill should always be visible in the "skills" section of
   * /resume, false if it should only appear when that section is expanded.
   */
  featured?: boolean;

  /**
   * True if this Skill should be visually emphasized emphasized everywhere
   * it appears (i.e., in both the "skills" and "experience" sections).
   * Highlighted Skills should always also be featured.
   */
  highlighted?: boolean;
};

/**
 * One or more roles held contiguously at or with a single Organization.
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
