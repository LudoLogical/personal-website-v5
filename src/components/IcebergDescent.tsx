"use client";

import { useId, useState, type PointerEvent } from "react";
import { twMerge } from "tailwind-merge";

export type Tier = {
  name: string;
  question: string;
  items: string[];
  depth: string;
  /** Panel background + text color classes */
  className: string;
};

export const DEFAULT_TIERS: Tier[] = [
  {
    name: "Events",
    question: "What happened?",
    items: ["confused users", "site crashes", "dev slowdowns"],
    depth: "0 m",
    className: "bg-blue-200 text-blue-950",
  },
  {
    name: "Patterns",
    question: "Why do those events keep happening?",
    items: ["unwieldy UI", "traffic spikes", "technical debt"],
    depth: "-30 m",
    className: "bg-blue-400 text-blue-950",
  },
  {
    name: "Structures",
    question: "What bolsters those patterns?",
    items: ["design systems", "tech stacks", "policies", "practices"],
    depth: "-90 m",
    className: "bg-blue-700 text-blue-50",
  },
  {
    name: "Mental Models",
    question: "Why are those structures in place?",
    items: ["assumptions", "values", "heuristics", "instincts"],
    depth: "-200 m",
    className: "bg-blue-950 text-blue-100",
  },
];

const PANEL_H = 120; // px — keep in sync with h-30 below
const EASE = "cubic-bezier(.4,0,.2,1)";

// Low-poly iceberg spanning the whole sliding strip. Coordinates are in a
// 312×480 viewBox (strip width × four default tiers); the tip pokes above the
// waterline in the first tier and the bulk sinks through the rest.
const ICE_W = 312;
const ICE_H = 480;
// Centred in the ink gap between the first tier's question and items lines
const WATERLINE = 82;
const ICE_POINTS: [number, number][] = [
  // Outline, clockwise from the peak
  [228, 16],
  [244, 34],
  [258, 56],
  [272, 82],
  [292, 128],
  [302, 196],
  [296, 268],
  [304, 336],
  [286, 404],
  [256, 450],
  [210, 472],
  [162, 458],
  [122, 420],
  [102, 352],
  [94, 282],
  [110, 206],
  [140, 132],
  [180, 82],
  [194, 54],
  [210, 36],
  // Interior
  [226, 60],
  [230, 112],
  [262, 160],
  [184, 150],
  [222, 212],
  [270, 236],
  [146, 236],
  [196, 290],
  [258, 310],
  [132, 330],
  [216, 372],
  [268, 378],
  [166, 410],
  [214, 432],
];
// Delaunay triangulation of ICE_POINTS, clipped to the outline
const ICE_FACETS: [number, number, number][] = [
  [0, 1, 19],
  [2, 3, 20],
  [17, 18, 20],
  [1, 2, 20],
  [19, 1, 20],
  [18, 19, 20],
  [3, 4, 21],
  [17, 20, 21],
  [20, 3, 21],
  [4, 5, 22],
  [21, 4, 22],
  [16, 17, 23],
  [17, 21, 23],
  [15, 16, 23],
  [21, 22, 23],
  [23, 22, 24],
  [5, 6, 25],
  [22, 5, 25],
  [24, 22, 25],
  [14, 15, 26],
  [15, 23, 26],
  [23, 24, 26],
  [24, 25, 27],
  [26, 24, 27],
  [6, 7, 28],
  [25, 6, 28],
  [27, 25, 28],
  [13, 14, 29],
  [14, 26, 29],
  [26, 27, 29],
  [27, 28, 30],
  [29, 27, 30],
  [7, 8, 31],
  [28, 7, 31],
  [30, 28, 31],
  [12, 13, 32],
  [13, 29, 32],
  [11, 12, 32],
  [29, 30, 32],
  [8, 9, 33],
  [31, 8, 33],
  [30, 31, 33],
  [9, 10, 33],
  [32, 30, 33],
  [10, 11, 33],
  [11, 32, 33],
];
// Fake lighting from the upper left, plus a little per-facet jitter so
// neighbouring facets read as distinct planes. 0 = darkest, 1 = brightest.
const ICE_SHADED = ICE_FACETS.map((f, i) => {
  const [x, y] = f
    .map((v) => ICE_POINTS[v])
    .reduce(([ax, ay], [bx, by]) => [ax + bx / 3, ay + by / 3], [0, 0]);
  const lit = 1 - (x - 94) / (304 - 94);
  const jitter = ((i * 37) % 11) / 10;
  return {
    points: f.map((v) => ICE_POINTS[v].join(",")).join(" "),
    shade: 0.6 * lit + 0.4 * jitter,
    depth: y / ICE_H,
  };
});

type Props = {
  label?: string;
  tiers?: Tier[];
  className?: string;
};

export default function IcebergDescent({
  label = "Systems Thinker",
  tiers = DEFAULT_TIERS,
  className,
}: Props) {
  const [level, setLevel] = useState<number | null>(null);
  const n = tiers.length;
  const active = level !== null;
  const lv = level ?? 0;

  const onMove = (e: PointerEvent<HTMLSpanElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(0.999, Math.max(0, (e.clientX - r.left) / r.width));
    const next = Math.floor(f * n);
    if (next !== level) setLevel(next);
  };

  return (
    <span
      onPointerMove={onMove}
      onPointerLeave={() => setLevel(null)}
      className={twMerge(
        "relative z-20 inline-block cursor-default",
        className,
      )}
    >
      <span className="block leading-none">{label}</span>

      {/* Scrub indicator */}
      <span
        aria-hidden
        className="absolute bottom-px h-[0.085em] rounded-full bg-primary"
        style={{
          width: `${100 / n}%`,
          left: `${(lv * 100) / n}%`,
          opacity: active ? 1 : 0,
          transition: "left 220ms cubic-bezier(.2,.7,.2,1), opacity 200ms ease",
        }}
      />

      {/* Porthole card */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-[calc(100%+12px)] left-1/2 flex h-30 w-82.5 overflow-hidden rounded-box border border-base-300 bg-base-200 text-base font-normal shadow-lg"
        style={{
          opacity: active ? 1 : 0,
          transform: `translate(-50%, ${active ? 0 : -6}px)`,
          transition: "opacity 200ms ease, transform 250ms ease",
        }}
      >
        {/* Depth rail */}
        <span className="relative w-4 flex-none border-r border-base-300 bg-neutral">
          <span className="absolute top-2.5 bottom-2.5 left-1.75 w-px bg-base-content/20" />
          <span
            className="absolute left-1 h-1.75 w-1.75 rounded-full bg-primary"
            style={{
              top: `calc(10px + ${lv} * (100% - 27px) / ${Math.max(1, n - 1)})`,
              transition: `top 450ms ${EASE}`,
            }}
          />
        </span>

        {/* Sliding strip */}
        <span className="flex-1 overflow-hidden">
          <span
            className="relative flex flex-col"
            style={{
              transform: `translateY(${-lv * PANEL_H}px)`,
              transition: `transform 450ms ${EASE}`,
            }}
          >
            <Iceberg height={n * PANEL_H} />
            {tiers.map((t) => (
              <span
                key={t.name}
                className={twMerge(
                  // Children positioned so they paint above the iceberg
                  "flex h-30 flex-col gap-1 px-4 py-3 *:relative",
                  t.className,
                )}
              >
                <span className="font-mono text-[10px]">{t.depth}</span>
                <span className="text-lg font-bold">{t.name}</span>
                <span className="text-xs italic">{t.question}</span>
                <span className="text-xs">{t.items.join(" · ")}</span>
              </span>
            ))}
          </span>
        </span>
      </span>
    </span>
  );
}

function Iceberg({ height }: { height: number }) {
  const id = useId();
  type Facet = (typeof ICE_SHADED)[number];
  const facets = (
    clip: string,
    fill: (f: Facet) => string,
    opacity: (f: Facet) => number,
  ) => (
    <g clipPath={`url(#${id}-${clip})`}>
      {ICE_SHADED.map((f) => (
        <polygon
          key={f.points}
          points={f.points}
          fill={fill(f)}
          fillOpacity={opacity(f)}
          stroke="white"
          strokeOpacity={0.15}
          strokeWidth={0.75}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${ICE_W} ${ICE_H}`}
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-0 w-full"
      style={{ height }}
    >
      <defs>
        <clipPath id={`${id}-above`}>
          <rect width={ICE_W} height={WATERLINE} />
        </clipPath>
        <clipPath id={`${id}-below`}>
          <rect y={WATERLINE} width={ICE_W} height={ICE_H - WATERLINE} />
        </clipPath>
      </defs>
      {/* Water between the waterline and the first tier's edge */}
      <rect
        y={WATERLINE}
        width={ICE_W}
        height={PANEL_H - WATERLINE}
        fill="var(--color-blue-400)"
        fillOpacity={0.45}
      />
      {/* Solid ice above water, shadowed facets tinted blue */}
      {facets(
        "above",
        (f) =>
          `color-mix(in oklch, var(--color-blue-300) ${Math.round((1 - f.shade) * 40)}%, white)`,
        () => 1,
      )}
      {/* Submerged ice: translucent, fading with depth */}
      {facets(
        "below",
        () => "white",
        (f) => (0.06 + 0.2 * f.shade) * (1 - 0.6 * f.depth),
      )}
      <line
        x1={0}
        x2={ICE_W}
        y1={WATERLINE}
        y2={WATERLINE}
        stroke="white"
        strokeOpacity={0.8}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
