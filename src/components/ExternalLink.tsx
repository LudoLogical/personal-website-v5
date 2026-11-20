import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

const KIND_CLASS_NAMES: Record<ExternalLinkProps["kind"], string> = {
  underline: "inline link whitespace-nowrap link-hover",
  inline:
    "inline link whitespace-nowrap decoration-current/40 underline-offset-2 transition-colors hover:decoration-current motion-reduce:transition-none",
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
         * - `"underline"`: underlined only on hover
         * - `"inline"`: like `"underline"`, but faintly underlined even
         *               when not hovered so that it stands out from the
         *               text around it
         * - `"highlight"`: brightened on hover; the content is placed
         *                  within a single `inline-flex` box
         * - `"button"`: the content is placed within a
         *               `btn-soft btn-sm` daisyUI button
         */
        kind: "underline" | "inline";

        /**
         * `true` if `content` is a string and should be prevented from
         * wrapping entirely, `false` if `content` is a `ReactNode` or
         * should be permitted to wrap (with the sole constraint that the
         * `ArrowUpRight` icon will never wrap separately from the last word)
         */
        nowrap?: boolean;

        /**
         * The content of the link. Must be plain text
         * iff using the `"underline"` or `"inline"` `kind`.
         */
        children: string;
      }
    | {
        // All props inherit doc comments from other `kind`s
        kind: "highlight" | "button";
        nowrap?: false;
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
  nowrap = false,
  className,
  children,
  ...props
}: ExternalLinkProps) => {
  const isText = kind === "underline" || kind === "inline";
  const lastWordStart = isText ? children.lastIndexOf(" ") + 1 : 0;
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      className={twMerge(KIND_CLASS_NAMES[kind], className)}
    >
      {isText ? (
        nowrap ? (
          <span className="whitespace-nowrap">{children}</span>
        ) : (
          <>
            <span className="whitespace-normal">
              {children.slice(0, lastWordStart)}
            </span>
            {children.slice(lastWordStart)}
          </>
        )
      ) : (
        children
      )}
      <ArrowUpRight
        aria-hidden
        className={twMerge(
          "size-[0.85em] shrink-0",
          isText && "ms-[0.2em] inline align-baseline",
        )}
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
};

export default ExternalLink;
