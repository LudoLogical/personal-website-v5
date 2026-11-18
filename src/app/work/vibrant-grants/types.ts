import type { ComponentType } from "react";

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
