import Image from "next/image";
import type { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import type { Receipt, Stakeholders } from "./types";

/**
 * The classes that size, position, and color each ring in a
 * {@link StakeholderRings} (and position its label), in order from the
 * outermost ring to the innermost one. Sizes and offsets are percentages
 * of the outermost ring's diameter.
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

/**
 * The angle, in degrees, between the first
 * and last pages in a {@link PageFan}.
 */
const PAGE_FAN_SPREAD = 60;

export type StakeholderRingsProps = {
  /**
   * The {@link Stakeholders} that label the rings in this
   * {@link StakeholderRings}, from the outermost ring to the innermost one.
   */
  stakeholders: Stakeholders;

  /**
   * Classes for the container `<div>` of this {@link StakeholderRings}.
   * Used to set its width (its height always matches its width).
   */
  className?: string;
};

/**
 * Renders the specified {@link Stakeholders} as labeled circles, each of
 * which sits inside (and near the bottom of) the circle for the next
 * broadest group.
 *
 * Exposed to ATs as a single image whose label lists the
 * {@link Stakeholders} in order.
 */
export const StakeholderRings = ({
  stakeholders,
  className,
}: StakeholderRingsProps) => (
  <div
    role="img"
    aria-label={`Nested circles depicting groups of stakeholders. From the broadest group to the narrowest one: ${stakeholders.join(", ")}.`}
    className={twMerge("relative aspect-square w-full", className)}
  >
    {stakeholders.map((stakeholder, i) => (
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
 * Renders the serrated edge left behind when a receipt is torn from its roll.
 * The teeth point down unless `flipped`.
 */
const TornEdge = ({ flipped = false }: { flipped?: boolean }) => (
  <div
    aria-hidden
    // Each 0.5rem-wide tile of the mask keeps only a downward-pointing triangle
    className={twMerge(
      "h-1 bg-stone-100 [mask:conic-gradient(from_-45deg_at_bottom,#0000,#000_1deg_89deg,#0000_90deg)_50%/0.5rem_100%]",
      flipped && "rotate-180",
    )}
  />
);

export type PaperReceiptProps = {
  /**
   * The {@link Receipt} to be rendered by this {@link PaperReceipt}.
   */
  receipt: Receipt;

  /**
   * Classes for the container `<div>` of this {@link PaperReceipt}.
   */
  className?: string;
};

/**
 * Renders the specified {@link Receipt} as a printed paper receipt whose
 * amount due is the sum of its line items. Every amount is expressed in
 * hours, to two decimal places.
 */
export const PaperReceipt = ({
  receipt: { title, subtitle, items },
  className,
}: PaperReceiptProps) => {
  const formatHours = (hours: number) => `${hours.toFixed(2)} hrs`;
  const hoursDue = items.reduce((sum, { hours }) => sum + hours, 0);

  return (
    <div
      className={twMerge(
        "w-72 font-mono text-xs text-stone-800 drop-shadow-xl",
        className,
      )}
    >
      <TornEdge flipped />
      <div className="flex flex-col gap-3 bg-stone-100 px-5 py-4">
        <p className="text-center uppercase">
          <strong className="block text-base tracking-widest">{title}</strong>
          {subtitle}
        </p>
        <hr className="border-dashed border-stone-400" />
        <dl className="flex flex-col gap-1.5">
          {items.map(({ label, hours }) => (
            <div key={label} className="flex justify-between gap-4">
              <dt>{label}</dt>
              <dd className="whitespace-nowrap tabular-nums">
                {formatHours(hours)}
              </dd>
            </div>
          ))}
        </dl>
        <hr className="border-dashed border-stone-400" />
        <dl className="flex justify-between gap-4 text-sm font-bold uppercase">
          <dt>Amount due</dt>
          <dd className="whitespace-nowrap tabular-nums">
            {formatHours(hoursDue)}
          </dd>
        </dl>
        {/* Barcode */}
        <div
          aria-hidden
          className="mt-2 h-8 bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_3px,currentColor_3px_4px,transparent_4px_7px,currentColor_7px_10px,transparent_10px_12px,currentColor_12px_13px,transparent_13px_15px)]"
        />
      </div>
      <TornEdge />
    </div>
  );
};
