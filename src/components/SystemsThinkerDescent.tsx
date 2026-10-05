"use client";

import { useState, type PointerEvent } from "react";

export type Tier = {
  name: string;
  question: string;
  items: string[];
  depth: string;
  /** Panel background */
  bg: string;
  /** Panel text color */
  fg: string;
};

export const DEFAULT_TIERS: Tier[] = [
  {
    name: "Events",
    question: "What happened?",
    items: ["a missed deadline", "a spike in churn", "a bad quarter"],
    depth: "0 m",
    bg: "oklch(0.92 0.03 235)",
    fg: "#1c1d1f",
  },
  {
    name: "Patterns",
    question: "What keeps happening?",
    items: [
      "recurring delays",
      "seasonal slumps",
      "the same fires every month",
    ],
    depth: "−30 m",
    bg: "oklch(0.82 0.06 235)",
    fg: "#1c1d1f",
  },
  {
    name: "Structures",
    question: "What drives it?",
    items: ["incentives", "policies", "information flows", "who decides"],
    depth: "−90 m",
    bg: "oklch(0.45 0.1 240)",
    fg: "#fbfaf7",
  },
  {
    name: "Mental models",
    question: "What beliefs hold it in place?",
    items: ["assumptions", "values", "“how things are done here”"],
    depth: "−200 m",
    bg: "oklch(0.3 0.08 245)",
    fg: "#fbfaf7",
  },
];

const PANEL_H = 120; // px — keep in sync with h-[120px] below
const EASE = "cubic-bezier(.4,0,.2,1)";

type Props = {
  label?: string;
  tiers?: Tier[];
  className?: string;
};

export default function IcebergDescent({
  label = "Systems Thinker",
  tiers = DEFAULT_TIERS,
  className = "",
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
      className={`relative z-20 inline-block cursor-default ${className}`}
    >
      <span className="block font-[Mulish] text-[48px] leading-[1.15] font-bold">
        {label}
      </span>

      {/* Scrub indicator */}
      <span
        aria-hidden
        className="absolute bottom-px h-0.75 bg-[oklch(0.58_0.16_40)]"
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
        className="pointer-events-none absolute top-[calc(100%+12px)] left-1/2 flex h-30 w-82.5 overflow-hidden border border-[#e2e0da] shadow-[0_8px_20px_rgba(28,29,31,0.12)]"
        style={{
          opacity: active ? 1 : 0,
          transform: `translate(-50%, ${active ? 0 : -6}px)`,
          transition: "opacity 200ms ease, transform 250ms ease",
        }}
      >
        {/* Depth rail */}
        <span className="relative w-4 flex-none border-r border-[#e2e0da] bg-[#fbfaf7]">
          <span className="absolute top-2.5 bottom-2.5 left-1.75 w-px bg-[#d6d3cc]" />
          <span
            className="absolute left-1 h-1.75 w-1.75 rounded-full bg-[oklch(0.58_0.16_40)]"
            style={{
              top: `calc(10px + ${lv} * (100% - 27px) / ${Math.max(1, n - 1)})`,
              transition: `top 450ms ${EASE}`,
            }}
          />
        </span>

        {/* Sliding strip */}
        <span className="flex-1 overflow-hidden">
          <span
            className="flex flex-col"
            style={{
              transform: `translateY(${-lv * PANEL_H}px)`,
              transition: `transform 450ms ${EASE}`,
            }}
          >
            {tiers.map((t) => (
              <span
                key={t.name}
                className="flex h-30 flex-col gap-1 px-4 py-3 font-[Mulish]"
                style={{ background: t.bg, color: t.fg }}
              >
                <span className="font-mono text-[10px]">{t.depth}</span>
                <span className="text-[18px] font-extrabold">{t.name}</span>
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
