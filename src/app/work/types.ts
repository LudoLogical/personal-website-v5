import type { ReactNode } from "react";
import type { Section, Subsection } from "./sections";

/**
 * A heading that labels a {@link Section}
 * or {@link Subsection} of a case study.
 */
export type Heading = {
  /**
   * The `id` of the `<section>`{@link Section} or
   * {@link Subsection} that this {@link Heading} labels.
   */
  id: string;

  /**
   * The text of this {@link Heading}.
   */
  label: string;
};

/**
 * A {@link Heading} that labels a top-level {@link Section} of a case study.
 */
export type SectionHeading = Heading & {
  /**
   * The {@link Heading}s of the {@link Subsection}s that fall under this
   * {@link SectionHeading}, if any.
   */
  subheadings?: Heading[];
};

/**
 * An image and its associated sizing and caption information.
 */
export type Picture = {
  /**
   * The path (in `public/`) to this {@link Picture}.
   */
  src: string;

  /**
   * The alt text for this {@link Picture}.
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
   * The caption to be displayed beneath this {@link Picture} wherever
   * it appears as a figure. Omitted if no explanation is necessary.
   */
  caption?: ReactNode;
};

/**
 * A {@link Picture} whose *entire* caption links to an external site.
 */
export type LinkCaptionedPicture = Omit<Picture, "caption"> & {
  /**
   * The caption to be displayed beneath this {@link LinkCaptionedPicture}.
   */
  caption: string;

  /**
   * The external link to be applied to the caption
   * beneath this {@link LinkCaptionedPicture}.
   */
  href: string;
};

/**
 * A screen recording showing a workflow
 * from a product presented in a case study.
 */
export type Demo = {
  /**
   * The path (in `public/`) to the video file for this {@link Demo}.
   */
  src: string;

  /**
   * A summary of the workflow shown in this {@link Demo}.
   */
  caption: string;
};

/**
 * A person who worked on a product presented in a case study.
 */
export type TeamMember = {
  /**
   * The full name of this {@link TeamMember}.
   */
  name: string;

  /**
   * A link to the LinkedIn profile of this {@link TeamMember}.
   */
  href: string;

  /**
   * The role that this {@link TeamMember} held on their team.
   */
  role: string;

  /**
   * The path (in `public/`) to a (square) portrait of this {@link TeamMember}.
   */
  portrait: string;
};

/**
 * An organization for which a product presented in a case study was created.
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
   * The path (in `public/`) to the logo for this {@link Client}. Expected
   * to be a square image with a filled (i.e., not transparent) background.
   */
  logo: string;
};

/**
 * A research method employed during a project presented in a case study.
 */
export type ResearchMethod = {
  /**
   * The name of this {@link ResearchMethod}.
   */
  name: string;

  /**
   * A summary of what this {@link ResearchMethod} was meant to accomplish.
   */
  purpose: ReactNode;
};

/**
 * A key finding gleaned from the research conducted
 * for a project presented in a case study.
 */
export type Insight = {
  /**
   * A one-sentence summary of this {@link Insight}.
   */
  headline: string;

  /**
   * An elaboration on the nature and significance of this {@link Insight}.
   */
  details: ReactNode;
};
