import type { ComponentType, ReactNode } from "react";

/**
 * A raster image (i.e., a photograph, diagram, or screenshot)
 * located in `public/`.
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
};

/**
 * A {@link Picture} of a project whose caption links to that project's webpage.
 */
export type ProjectPhoto = Picture & {
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
 * A screen recording of one part of the Vibrant Grants workflow.
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
 * A person who worked on Vibrant Grants.
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
 * A category of services that New Sun Rising offers to its clients.
 */
export type Service = {
  /**
   * The name of this {@link Service}.
   */
  name: string;

  /**
   * A summary of what this {@link Service} helps clients accomplish.
   */
  description: string;

  /**
   * An icon that represents this {@link Service}.
   */
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

/**
 * The groups of people implicated in the design of Vibrant
 * Grants, in order from the broadest group to the narrowest one.
 */
export type Stakeholders = [string, string, string, string];

/**
 * A research method with a publicly available explainer.
 */
export type ResearchActivity = {
  /**
   * The name of this {@link ResearchActivity}.
   */
  label: string;

  /**
   * A webpage that explains this {@link ResearchActivity}.
   */
  href: string;
};

/**
 * An itemized bill whose currency is hours of time instead of money.
 */
export type Receipt = {
  /**
   * The name of the tool that issued this {@link Receipt}.
   */
  title: string;

  /**
   * A description of the tool that issued this {@link Receipt}.
   */
  subtitle: string;

  /**
   * The line items on this {@link Receipt},
   * in the order in which they are to be displayed.
   */
  items: {
    /**
     * The task that this line item bills for.
     */
    label: string;

    /**
     * The duration, in hours, of the task that this line item bills for.
     */
    hours: number;
  }[];
};

/**
 * A single capability of Vibrant Grants.
 */
export type Feature = {
  /**
   * The name of this {@link Feature}.
   */
  title: string;

  /**
   * An explanation of what this {@link Feature} does and why it matters.
   */
  description: ReactNode;

  /**
   * The visual that demonstrates this {@link Feature}.
   * - `"video"`: a looping screen recording located at `src` (in `public/`)
   * - `"picture"`: a static {@link Picture}
   */
  media: { kind: "video"; src: string } | { kind: "picture"; picture: Picture };
};

/**
 * The {@link Feature}s that support one stage of the grant lifecycle.
 */
export type FeatureGroup = {
  /**
   * The `id` of the `<section>` in which this {@link FeatureGroup} is rendered.
   */
  id: string;

  /**
   * The goal of the stage of the grant lifecycle
   * that this {@link FeatureGroup} supports.
   */
  title: string;

  /**
   * The {@link Feature}s in this {@link FeatureGroup},
   * in the order in which they are to be displayed.
   */
  features: Feature[];
};
