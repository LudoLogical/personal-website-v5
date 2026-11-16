import { Quote } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import type { Client, Picture } from "./types";

export type ParagraphProps = {
  /**
   * The content of this {@link Paragraph}.
   */
  children: ReactNode;
};

/**
 * Renders the specified `children` as a paragraph
 * of body copy in which `<strong>` text stands out.
 */
export const Paragraph = ({ children }: ParagraphProps) => (
  <p className="text-base-content/75 [&_strong]:text-base-content">
    {children}
  </p>
);

export type CaptionProps = {
  /**
   * The content of this {@link Caption}.
   */
  children: ReactNode;
};

/**
 * Renders the specified `children` as a caption for the `<figure>` that
 * contains this component, centered beneath the visual that it describes.
 *
 * Note: This component uses `text-box-trim` (which clamps the top and bottom
 * of its bounding box to the cap height of the first line and the baseline of
 * the last line, respectively, making vertical spacing easier to optimize).
 */
export const Caption = ({ children }: CaptionProps) => (
  <figcaption className="px-4 text-center text-sm text-balance text-base-content/60 text-box-trim">
    {children}
  </figcaption>
);

export type FigureProps = {
  /**
   * The {@link Picture} to be rendered in this {@link Figure}.
   */
  picture: Picture;

  /**
   * The `sizes` attribute of the `<img>` in this {@link Figure}. Defaults
   * to a value that assumes a {@link Figure} as wide as the page's content.
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
 * Renders the specified {@link Picture} with
 * rounded corners and above its `caption` (if any).
 */
export const Figure = ({
  picture: { src, alt, width, height, caption },
  sizes = "(min-width: 1024px) 728px, 100vw",
  className,
  imageClassName,
}: FigureProps) => (
  <figure className={twMerge("flex flex-col gap-4", className)}>
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={twMerge("h-auto w-full rounded-xl", imageClassName)}
    />
    {caption && <Caption>{caption}</Caption>}
  </figure>
);

export type TestimonialProps = {
  /**
   * The content of this {@link Testimonial}
   * (without surrounding quotation marks).
   */
  quote: string;

  /**
   * `true` if this {@link Testimonial} should be visually
   * emphasized, `false` otherwise (and by default).
   */
  featured?: boolean;

  /**
   * The attribution to be displayed beneath the `quote`.
   */
  children?: ReactNode;
};

/**
 * Renders the specified `quote` as a callout, wrapped in quotation
 * marks and followed by the specified attribution (if any).
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

export type ClientLogoProps = {
  /**
   * The {@link Client} whose logo is
   * to be rendered in this {@link ClientLogo}.
   */
  client: Client;
};

/**
 * Renders the logo of the specified {@link Client} in a squircle.
 * Hidden from ATs because the name of the {@link Client} should
 * always be displayed alongside it.
 */
export const ClientLogo = ({ client: { logo } }: ClientLogoProps) => (
  <Image
    src={logo}
    alt=""
    width={256}
    height={256}
    sizes="40px"
    aria-hidden
    className="mask size-10 shrink-0 mask-squircle"
  />
);
