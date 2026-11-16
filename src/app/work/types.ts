import type { ReactNode } from "react";

/**
 * A heading that labels a section of a case study.
 */
export type Heading = {
  /**
   * The `id` of the `<section>` that this {@link Heading} labels.
   */
  id: string;

  /**
   * The text of this {@link Heading}.
   */
  title: string;
};

/**
 * A {@link Heading} that labels a top-level section of a case study.
 */
export type SectionHeading = Heading & {
  /**
   * The {@link Heading}s of the subsections that the table of contents
   * lists beneath this {@link SectionHeading}. Omitted if it lists none.
   */
  subheadings?: Heading[];
};

/**
 * An image (i.e., a photograph, diagram, or
 * screenshot) located in `public/`.
 */
export type Picture = {
  /**
   * The path (in `public/`) to this {@link Picture}.
   */
  src: string;

  /**
   * The text alternative for this {@link Picture}.
   */
  alt: string;

  /**
   * The intrinsic width, in pixels, of this {@link Picture}.
   */
  width: number;

  /**
   * The intrinsic height, in pixels, of this {@link Picture}.
   */
  height: number;

  /**
   * The caption displayed beneath this {@link Picture} wherever it appears
   * as a figure. Omitted if this {@link Picture} needs no explanation.
   */
  caption?: ReactNode;
};

/**
 * A {@link Picture} of a project whose caption links to that project's webpage.
 */
export type ProjectPhoto = Omit<Picture, "caption"> & {
  /**
   * The name of the project depicted in this {@link ProjectPhoto}.
   */
  caption: string;

  /**
   * The webpage of the project depicted in this {@link ProjectPhoto}.
   */
  href: string;
};

/**
 * A screen recording of one part of the
 * workflow that a case study presents.
 */
export type Demo = {
  /**
   * The path (in `public/`) to the video file for this {@link Demo}.
   */
  src: string;

  /**
   * A summary of what the user accomplishes in this {@link Demo}.
   */
  caption: string;
};

/**
 * A person who worked on the project that a case study presents.
 */
export type TeamMember = {
  /**
   * The full name of this {@link TeamMember}.
   */
  name: string;

  /**
   * The LinkedIn profile of this {@link TeamMember}.
   */
  href: string;

  /**
   * The role(s) that this {@link TeamMember} held on the team.
   */
  role: string;

  /**
   * The path (in `public/`) to a square portrait of this {@link TeamMember}.
   */
  portrait: string;

  /**
   * `true` if this {@link TeamMember} should be visually
   * emphasized, `false` otherwise (and by default).
   */
  highlighted?: boolean;
};

/**
 * An organization for which the project
 * that a case study presents was carried out.
 */
export type Client = {
  /**
   * The name of this {@link Client}.
   */
  name: string;

  /**
   * The website for this {@link Client}.
   */
  href: string;

  /**
   * The path (in `public/`) to the logo for this {@link Client}. Expected to
   * be a square image with a filled (i.e., not transparent) background.
   */
  logo: string;
};

/**
 * A research method employed during the project that a case study presents.
 */
export type Method = {
  /**
   * The name of this {@link Method}.
   */
  title: string;

  /**
   * A summary of what this {@link Method} was meant to
   * accomplish. Omitted if its name needs no explanation.
   */
  purpose?: ReactNode;
};

/**
 * Something learned from the research
 * conducted for the project that a case study presents.
 */
export type Finding = {
  /**
   * A statement of this {@link Finding}.
   */
  title: string;

  /**
   * An elaboration on this {@link Finding} and what follows from it.
   */
  description: ReactNode;
};
