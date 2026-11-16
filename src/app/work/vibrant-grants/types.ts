import type { ComponentType, ReactNode } from "react";
import type { Heading, Picture } from "@/app/work/types";

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
 * The {@link Feature}s that support one stage of the grant lifecycle,
 * labeled by a {@link Heading} whose `title` is the goal of that stage.
 */
export type FeatureGroup = Heading & {
  /**
   * The {@link Feature}s in this {@link FeatureGroup},
   * in the order in which they are to be displayed.
   */
  features: Feature[];
};
