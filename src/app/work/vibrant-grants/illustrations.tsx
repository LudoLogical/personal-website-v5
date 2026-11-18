import Image from "next/image";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import type { Picture } from "@/app/work/types";

/**
 * The groups of people implicated in the design of Vibrant Grants,
 * in order from the broadest group to the narrowest one.
 */
const STAKEHOLDERS = [
  "Community members",
  "All non-profits",
  "Client non-profits",
  "NSR",
];

/**
 * The classes that size, position, and color each ring in a
 * {@link StakeholderRings} (and position its label), in the same order as
 * {@link STAKEHOLDERS}. Sizes and offsets are percentages of the outermost
 * ring's diameter.
 */
const RING_CLASS_NAMES: { ring: string; label: string }[] = [
  { ring: "bottom-0 size-full bg-yellow-200", label: "mt-[9%]" },
  {
    ring: "bottom-[5.6%] size-[74.5%] border-2 border-yellow-900 bg-yellow-300",
    label: "mt-[11%]",
  },
  {
    ring: "bottom-[8.4%] size-[52.9%] border-2 border-dashed border-yellow-900 bg-yellow-400",
    label: "mt-[15%]",
  },
  {
    ring: "bottom-[12.4%] size-[33.5%] items-center border-2 border-yellow-900 bg-yellow-500",
    label: "text-base",
  },
];

export type StakeholderRingsProps = {
  /**
   * Classes for the container `<div>` of this {@link StakeholderRings}.
   * Used to set its width (its height always matches its width).
   */
  className?: string;
};

/**
 * Renders the {@link STAKEHOLDERS} as labeled circles, each of which
 * sits inside (and near the bottom of) the circle for the next
 * broadest group.
 *
 * Exposed to ATs as a single image whose label lists the
 * {@link STAKEHOLDERS} in order.
 */
export const StakeholderRings = ({ className }: StakeholderRingsProps) => (
  <div
    role="img"
    aria-label={`Nested circles depicting groups of stakeholders. From the broadest group to the narrowest one: ${STAKEHOLDERS.join(", ")}.`}
    className={twMerge("relative aspect-square w-full", className)}
  >
    {STAKEHOLDERS.map((stakeholder, i) => (
      <div
        key={stakeholder}
        className={twMerge(
          "absolute left-1/2 flex -translate-x-1/2 justify-center rounded-full",
          RING_CLASS_NAMES[i].ring,
        )}
      >
        <span
          className={twMerge(
            "text-xs leading-none font-bold whitespace-nowrap text-yellow-950",
            RING_CLASS_NAMES[i].label,
          )}
        >
          {stakeholder}
        </span>
      </div>
    ))}
  </div>
);

export type SplitPictureProps = {
  /**
   * The {@link Picture} whose left half is rendered in this
   * {@link SplitPicture}. Its intrinsic dimensions must match `right`'s.
   */
  left: Picture;

  /**
   * The {@link Picture} whose right half
   * is rendered in this {@link SplitPicture}.
   */
  right: Picture;
};

/**
 * Renders the left half of the specified `left` {@link Picture} beside
 * the right half of the specified `right` one, as a single picture with
 * rounded corners and no visible boundary between the halves.
 *
 * Exposed to ATs as two images, each with its own text alternative.
 */
export const SplitPicture = ({ left, right }: SplitPictureProps) => (
  // Both pictures share the grid's only cell, so they overlap exactly
  <div className="grid overflow-hidden rounded-xl *:col-start-1 *:row-start-1">
    <Image
      src={left.src}
      alt={left.alt}
      width={left.width}
      height={left.height}
      className="h-auto w-full"
    />
    <Image
      src={right.src}
      alt={right.alt}
      width={right.width}
      height={right.height}
      className="h-auto w-full [clip-path:inset(0_0_0_50%)]"
    />
  </div>
);

/**
 * The angle, in degrees, between the first
 * and last pages in a {@link PageFan}.
 */
const PAGE_FAN_SPREAD = 60;

export type PageFanProps = {
  /**
   * The paths (in `public/`) to images of the pages of a US Letter
   * document, in order from its first page to its last one.
   */
  pages: string[];

  /**
   * A description of this {@link PageFan}. Only exposed to ATs.
   */
  label: string;
};

/**
 * Renders the specified `pages` fanned out like a hand of playing cards.
 * The first page lies on top of the others at the left end of the fan,
 * and each subsequent page peeks out from beneath the right edge of the
 * one before it.
 *
 * Exposed to ATs as a single image with the specified `label`.
 */
export const PageFan = ({ pages, label }: PageFanProps) => (
  // Every page turns about a shared pivot located 1.6 page widths below
  // its bottom edge. The fan that results is 3.76 page widths wide and,
  // w/ a little room for shadows, 1.86 tall, and its lowest corners sit
  // 0.49 page widths below the bottom edge of an unturned page.
  <div role="img" aria-label={label} className="relative aspect-[3.76/1.86]">
    {pages.map((src, i) => (
      <Image
        key={src}
        src={src}
        alt=""
        width={612}
        height={792}
        sizes="(min-width: 1024px) 194px, 27vw"
        className="absolute bottom-[26.6%] left-[36.7%] h-auto w-[26.6%] origin-[50%_224%] rotate-(--page-fan-angle) rounded-xs shadow-[0_0_0.75rem_rgb(0_0_0/0.45)]"
        style={
          {
            "--page-fan-angle": `${(i / (pages.length - 1) - 0.5) * PAGE_FAN_SPREAD}deg`,
            zIndex: pages.length - i,
          } as CSSProperties
        }
      />
    ))}
  </div>
);

/**
 * The itemized bills, whose currency is hours of time instead of money,
 * rendered by a {@link ReceiptComparison}, in order from left to right.
 */
const RECEIPTS = [
  {
    headline: "Shiny New Tool",
    items: [
      { label: "Read comparison articles", hours: 0.75 },
      { label: "Compare pricing options", hours: 0.25 },
      { label: "Watch tutorial videos", hours: 1 },
      { label: "Import and organize data", hours: 1.5 },
      { label: "Migrate workflows", hours: 2 },
      { label: "Re-train volunteers", hours: 2 },
    ],
  },
  {
    headline: "Old Reliable",
    items: [{ label: "Just pull it up", hours: 0 }],
  },
];

/**
 * Renders an itemized bill with the specified `headline` and line `items`
 * whose amount due is the sum of its line items. Every amount is expressed
 * in hours, to two decimal places.
 */
const ReceiptCard = ({
  headline,
  items,
}: {
  headline: string;
  items: { label: string; hours: number }[];
}) => {
  const formatHours = (hours: number) => `${hours.toFixed(2)} hrs`;
  const hoursDue = items.reduce((sum, { hours }) => sum + hours, 0);

  return (
    <div className="card w-full max-w-72 border border-base-content/10 bg-base-200 text-sm">
      <div className="card-body gap-4 p-5">
        <p className="text-center font-bold tracking-widest uppercase">
          {headline}
        </p>
        <hr className="border-dashed border-base-content/20" />
        <dl className="flex flex-col gap-1.5">
          {items.map(({ label, hours }) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="text-base-content/75">{label}</dt>
              <dd className="whitespace-nowrap tabular-nums">
                {formatHours(hours)}
              </dd>
            </div>
          ))}
        </dl>
        <hr className="border-dashed border-base-content/20" />
        <dl className="flex justify-between gap-4 font-bold">
          <dt className="tracking-wide uppercase">Amount due</dt>
          <dd className="whitespace-nowrap text-primary tabular-nums">
            {formatHours(hoursDue)}
          </dd>
        </dl>
      </div>
    </div>
  );
};

/**
 * Renders the {@link RECEIPTS} as itemized bills side by side,
 * or stacked vertically on narrow viewports.
 */
export const ReceiptComparison = () => (
  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
    {RECEIPTS.map(({ headline, items }) => (
      <ReceiptCard key={headline} headline={headline} items={items} />
    ))}
  </div>
);
