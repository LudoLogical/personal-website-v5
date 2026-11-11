import { Quote } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import type { Picture } from "./types";

export type FigureProps = {
  /**
   * The {@link Picture} to be rendered in this {@link Figure}.
   */
  picture: Picture;

  /**
   * The caption displayed beneath the {@link Picture} in this
   * {@link Figure}. Omitted if said {@link Picture} needs no explanation.
   */
  caption?: ReactNode;

  /**
   * The `sizes` attribute of the `<img>` in this {@link Figure}. Defaults
   * to a value that suits a {@link Figure} as wide as the page's content.
   */
  sizes?: string;

  /**
   * Classes for the container `<figure>` of this {@link Figure}.
   */
  className?: string;

  /**
   * Classes for the `<img>` in this {@link Figure}. Applied
   * after (and thus take precedence over) internal defaults.
   */
  imageClassName?: string;
};

/**
 * Renders the specified {@link Picture} with rounded
 * corners above the specified `caption` (if any).
 */
export const Figure = ({
  picture: { src, alt, width, height },
  caption,
  sizes = "(min-width: 1024px) 728px, 100vw",
  className,
  imageClassName,
}: FigureProps) => (
  <figure className={twMerge("flex flex-col gap-3", className)}>
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={twMerge("h-auto w-full rounded-xl", imageClassName)}
    />
    {caption && (
      <figcaption className="text-sm text-base-content/60">
        {caption}
      </figcaption>
    )}
  </figure>
);

export type TestimonialProps = {
  /**
   * The words quoted in this {@link Testimonial},
   * without quotation marks around them.
   */
  quote: string;

  /**
   * `true` if this {@link Testimonial} should be visually
   * emphasized, `false` otherwise (and by default).
   */
  featured?: boolean;

  /**
   * The attribution displayed beneath the `quote`. Omitted if this
   * {@link Testimonial} is attributed elsewhere (e.g., as part of a group).
   */
  children?: ReactNode;
};

/**
 * Renders the specified `quote` as a callout.
 */
export const Testimonial = ({
  quote,
  featured = false,
  children,
}: TestimonialProps) => (
  <figure
    className={twMerge(
      "card border border-base-content/10 bg-base-200",
      featured && "border-primary/40",
    )}
  >
    <div className="card-body gap-4 p-5 sm:p-6">
      <Quote aria-hidden className="size-5 fill-current text-primary" />
      <blockquote
        className={twMerge(
          "text-lg leading-snug font-semibold",
          featured && "sm:text-2xl",
        )}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>
      {children && <figcaption>{children}</figcaption>}
    </div>
  </figure>
);
