import { ArrowUpRight } from "lucide-react";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type ExternalLinkProps = Omit<ComponentProps<"a">, "target" | "rel"> & {
  /**
   * Classes for the ArrowUpRight icon that
   * follows the children of this ExternalLink.
   */
  iconClassName?: string;
};

/**
 * Renders a link to a page outside of this website that opens in a new tab.
 * The link is annotated with an ArrowUpRight icon and an explanatory note
 * for screen readers.
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
