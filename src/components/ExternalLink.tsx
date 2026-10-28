import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const KIND_CLASS_NAMES: Record<ExternalLinkProps["kind"], string> = {
  underline: "inline link whitespace-nowrap link-hover",
  highlight:
    "inline-flex items-center gap-2 transition-colors text-base-content/55 hover:text-base-content/85",
  button: "btn inline-flex items-center gap-1 btn-soft text-sm btn-sm",
};

export type ExternalLinkProps = Omit<
  ComponentProps<"a">,
  "target" | "rel" | "children"
> &
  (
    | {
        /**
         * The manner in which this {@link ExternalLink} should be rendered.
         * - `"underline"`: underlined on hover; the content (which must be
         *                  plain text) is permitted to wrap with the sole
         *                  constraint that the `ArrowUpRight` icon will
         *                  never wrap separately from the last word
         * - `"highlight"`: brightened on hover; the content is placed
         *                  within a single `inline-flex` box
         * - `"button"`: the content is placed within a
         *               `btn-soft btn-sm` daisyUI button
         */
        kind: "underline";
        /**
         * The content of the link.
         * Must be plain text iff using the `"underline"` `kind`.
         */
        children: string;
      }
    | {
        kind: "highlight" | "button";
        children: ReactNode;
      }
  );

/**
 * Renders a link to a page outside of this website that opens in a new tab.
 * The link is annotated with an `ArrowUpRight` icon and an explanatory note
 * for screen readers.
 */
const ExternalLink = ({
  kind,
  className,
  children,
  ...props
}: ExternalLinkProps) => {
  const lastWordStart =
    kind === "underline" ? children.lastIndexOf(" ") + 1 : 0;
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      className={twMerge(KIND_CLASS_NAMES[kind], className)}
    >
      {kind === "underline" ? (
        <>
          <span className="whitespace-normal">
            {children.slice(0, lastWordStart)}
          </span>
          {children.slice(lastWordStart)}
        </>
      ) : (
        children
      )}
      <ArrowUpRight
        aria-hidden
        className={twMerge(
          "size-[0.85em] shrink-0",
          kind === "underline" && "ms-[0.2em] inline align-baseline",
        )}
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
};

export default ExternalLink;
