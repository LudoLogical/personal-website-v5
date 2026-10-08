import { ArrowUpRight } from "lucide-react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type ExternalLinkProps = Omit<ComponentProps<"a">, "target" | "rel"> & {
  /**
   * Classes for the outbound-arrow icon that follows the link's children.
   */
  iconClassName?: string;
};

/**
 * Renders a link to a page outside of this website that opens in a new tab.
 *
 * Convention: every external link on this website should be rendered via
 * this component so that it is consistently annotated with an outbound-arrow
 * icon (and an equivalent note for screen reader users).
 */
const ExternalLink = ({
  children,
  className,
  iconClassName,
  ...props
}: ExternalLinkProps) => (
  <a
    target="_blank"
    rel="noopener noreferrer"
    {...props}
    className={twMerge("inline-flex items-center gap-1", className)}
  >
    {children}
    <ArrowUpRight
      aria-hidden
      className={twMerge("size-[0.85em] shrink-0", iconClassName)}
    />
    <span className="sr-only">(opens in a new tab)</span>
  </a>
);

export default ExternalLink;
