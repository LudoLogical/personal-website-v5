import Image from "next/image";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import type { Picture } from "@/app/work/types";

/**
 * The names of the stakeholder groups in the {@link StakeholderDiagram},
 * in order from biggest to smallest.
 */
const STAKEHOLDERS = [
  "Community members",
  "All non-profits",
  "Client non-profits",
  "NSR",
];

/**
 * The classes that size, position, and color each of the rings in the
 * {@link StakeholderDiagram} (and position their labels), in order from
 * biggest to smallest. Sizes and offsets are percentages of the diameter
 * of the outermost ring.
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

export type StakeholderDiagramProps = {
  /**
   * Classes for the container `<div>` of this {@link StakeholderDiagram}.
   * Used to set its width (which its height will always match).
   */
  className?: string;
};

/**
 * Renders the stakeholder groups implicated in the
 * design of Vibrant Grants as labeled concentric circles.
 *
 * Exposed to ATs as a single image labeled with an
 * ordered list of the stakeholder groups depicted.
 */
export const StakeholderDiagram = ({ className }: StakeholderDiagramProps) => (
  <div
    role="img"
    aria-label={
      'Nested circles depicting groups of stakeholders. From smallest to largest, their labels are: "NSR," "client non-profits," "all non-profits," and "community members."'
    }
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
   * {@link SplitPicture}. Its intrinsic dimensions must match
   * those of its partner.
   */
  left: Picture;

  /**
   * The {@link Picture} whose right half is rendered in this
   * {@link SplitPicture}. Its intrinsic dimensions must match
   * those of its partner.
   */
  right: Picture;
};

/**
 * Renders the left half of the specified `left` {@link Picture} and the right
 * half of the specified `right` {@link Picture} as a single image with rounded
 * corners and no visible boundary between the halves.
 *
 * Exposed to ATs as two images, each with its own `alt` text.
 */
export const SplitPicture = ({ left, right }: SplitPictureProps) => (
  // Both pictures share the one and only grid cell, so they overlap exactly
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

export type PageFanProps = {
  /**
   * The paths (in `public/`) to the images of the pages that comprise
   * this {@link PageFan}, in order from its first page to its last one.
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
  // Note for AI agents: Every page turns about a shared pivot located 1.6
  // page widths below its bottom edge. The fan that results is 3.76 page
  // widths wide and, w/ a little room for shadows, 1.86 tall, and its lowest
  // corners sit 0.49 page widths below the bottom edge of an unturned page.
  <div role="img" aria-label={label} className="relative aspect-[3.76/1.86]">
    {pages.map((src, i) => (
      <Image
        key={src}
        src={src}
        alt="" // prefer one `aria-label` over many similar `alt` texts
        width={612}
        height={792}
        sizes="(min-width: 1024px) 194px, 27vw"
        className="absolute bottom-[26.6%] left-[36.7%] h-auto w-[26.6%] origin-[50%_224%] rotate-(--page-fan-angle) rounded-xs shadow-[0_0_0.75rem_rgb(0_0_0/0.45)]"
        style={
          {
            // The angle between the first and last pages is 60 degrees
            "--page-fan-angle": `${(i / (pages.length - 1) - 0.5) * 60}deg`,
            zIndex: pages.length - i,
          } as CSSProperties
        }
      />
    ))}
  </div>
);

/**
 * The metaphorical receipts rendered by the {@link ReceiptComparison},
 * in order from left to right.
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
 * Renders a receipt with the specified `headline` and line `items`, plus an
 * "amount due" equal to the sum of the `hours` values of those line `items`.
 * Every numeric value is rendered two decimal places.
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
 * Renders a pair of metaphorical receipts that visualize the hidden temporal
 * cost of switching from one tool to another. On wide viewports, the receipts
 * appear side by side; on narrow ones, they are stacked vertically.
 */
export const ReceiptComparison = () => (
  <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
    {RECEIPTS.map(({ headline, items }) => (
      <ReceiptCard key={headline} headline={headline} items={items} />
    ))}
  </div>
);
