"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { orthogonalPathFinding, type Point } from "orthogonal-path-finding";
import { roundCorners } from "svg-round-corners";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

type Box = { l: number; r: number; t: number; b: number };

type Layout = {
  unit: number;
  box: Box;
};

type Side = "top" | "bottom" | "left" | "right";

// A point where an arrow leaves or lands, plus how far it travels straight
// out of that side before the router takes over.
type Port = Point & { side: Side; reach: number };

const MARKER_ID = "systems-title-straight-head";

// All arrows grow in lockstep over this duration (s).
const DURATION = 1;

// Retracting runs faster than growing.
const RETRACT_SPEEDUP = 1.8;

// Fraction of the animation over which arrowheads scale up from nothing.
const HEAD_GROW = 0.35;

const EASE = "power2.inOut";

const OUTWARD: Record<Side, Point> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const xAt = (box: Box, fraction: number) => box.l + (box.r - box.l) * fraction;
const yAt = (box: Box, fraction: number) => box.t + (box.b - box.t) * fraction;

const extend = ({ x, y, side, reach }: Port): Point => ({
  x: x + OUTWARD[side].x * reach,
  y: y + OUTWARD[side].y * reach,
});

// Drops repeated points and the middle of any straight run, so every
// remaining vertex is a real corner for svg-round-corners to round.
function corners(points: Point[]) {
  const unique = points.filter(
    (p, i) => i === 0 || p.x !== points[i - 1].x || p.y !== points[i - 1].y,
  );
  return unique.filter((p, i) => {
    const prev = unique[i - 1];
    const next = unique[i + 1];
    if (!prev || !next) return true;
    return !(
      (prev.x === p.x && p.x === next.x) ||
      (prev.y === p.y && p.y === next.y)
    );
  });
}

// Each arrow runs between two ports; orthogonal-path-finding routes the
// middle stretch around the (padded) title, then the corners get rounded.
//
// Positions are fractions of the <h1>'s box (0 = left/top edge, 1 = right/
// bottom edge; values outside 0–1 lie beyond it). Distances are in ems.
function arrowPaths({ unit: u, box }: Layout) {
  const gap = 0.18 * u;
  const obstacles = [
    { x: box.l, y: box.t, width: box.r - box.l, height: box.b - box.t },
  ];

  // A point on one side of the title, `at` of the way along that side.
  const port = (side: Side, at: number, reach: number): Port => ({
    x:
      side === "left"
        ? box.l - gap
        : side === "right"
          ? box.r + gap
          : xAt(box, at),
    y:
      side === "top"
        ? box.t - gap
        : side === "bottom"
          ? box.b + gap
          : yAt(box, at),
    side,
    reach: reach * u,
  });

  // An end floating in space rather than landing on the title.
  const free = (x: number, y: number): Port => ({
    x: xAt(box, x),
    y: yAt(box, y),
    side: "top",
    reach: 0,
  });

  // Fractions rarely line up to the pixel, so an end that is nearly level
  // with (or directly across from) the start snaps into line; otherwise the
  // router would add a tiny jog.
  const align = (from: Point, to: Port): Port => {
    const snap = 0.05 * u;
    return {
      ...to,
      x: Math.abs(to.x - from.x) < snap ? from.x : to.x,
      y: Math.abs(to.y - from.y) < snap ? from.y : to.y,
    };
  };

  const connect = (from: Port, rawTo: Port) => {
    const to = align(extend(from), rawTo);
    const route = orthogonalPathFinding(extend(from), extend(to), obstacles, {
      padding: 0.15 * u,
    }).path;
    const middle = route.length ? route : [extend(from), extend(to)];
    const d = corners([from, ...middle, to])
      .map(({ x, y }, i) => `${i ? "L" : "M"}${x} ${y}`)
      .join(" ");
    return roundCorners(d, 0.3 * u, 2).path;
  };

  // For reference, the words span roughly 0–0.28 (Daniel), 0.31–0.61
  // ("Ludo") and 0.64–1 (DeAnda) of the title's width.
  return [
    // Daniel → "Ludo", over the top
    connect(port("top", 0.15, 0.6), port("top", 0.35, 0.6)),
    // "Ludo" → DeAnda, over the top at a lower level
    connect(port("top", 0.75, 0.6), port("top", 0.55, 0.6)),
    // DeAnda → Daniel, a wide feedback loop underneath everything
    connect(port("bottom", 0.85, 1.2), port("bottom", 0.25, 1.2)),
    // DeAnda → "Ludo", a tight feedback loop underneath
    connect(port("bottom", 0.45, 0.6), port("bottom", 0.65, 0.6)),
    // Out of the left edge and up
    connect(port("left", 0.5, 0.5), free(-0.15, -0.6)),
    // Out of the right edge and down
    connect(port("right", 0.5, 0.5), free(1.15, 1 + 0.6)),
    // Out of the top-right and off to the right
    connect(port("top", 0.95, 0.6), free(1.15, -0.6)),
    // Out of the bottom-left and off to the left
    connect(port("bottom", 0.05, 0.6), free(-0.15, 1 + 0.6)),
  ];
}

export function SystemsTitleStraight() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const active = useRef(false);
  // Carries the timeline's position across rebuilds (e.g. on resize).
  const savedProgress = useRef(0);

  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const title = titleRef.current;
    if (!wrapper || !title) return;

    const measure = () => {
      const origin = wrapper.getBoundingClientRect();
      const rect = title.getBoundingClientRect();
      setLayout({
        unit: parseFloat(getComputedStyle(title).fontSize),
        box: {
          l: rect.left - origin.left,
          r: rect.right - origin.left,
          t: rect.top - origin.top,
          b: rect.bottom - origin.top,
        },
      });
    };

    let mounted = true;
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    document.fonts.ready.then(() => mounted && measure());
    return () => {
      mounted = false;
      observer.disconnect();
    };
  }, []);

  const setActive = (value: boolean) => {
    active.current = value;
    const tl = timeline.current;
    if (!tl) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tl.pause().progress(value ? 1 : 0);
    } else if (value) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(RETRACT_SPEEDUP).reverse();
    }
  };

  // Rebuild the timeline whenever the arrow geometry changes.
  useLayoutEffect(() => {
    if (!layout) return;

    const ctx = gsap.context((self) => {
      const arrows = self.selector!("[data-arrow]") as SVGGElement[];
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: DURATION, ease: EASE },
      });

      arrows.forEach((arrow) => {
        const path = arrow.querySelector("[data-body]")!;
        const tip = arrow.querySelector("[data-tip]")!;
        const head = arrow.querySelector("[data-head]")!;

        tl.fromTo(
          arrow,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.05, ease: "none" },
          0,
        )
          .fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%" }, 0)
          .to(
            tip,
            {
              motionPath: {
                path: path as SVGPathElement,
                align: path as SVGPathElement,
                alignOrigin: [1, 0.5],
                autoRotate: true,
              },
            },
            0,
          )
          .fromTo(
            head,
            { scale: 0 },
            {
              scale: 1,
              duration: DURATION * HEAD_GROW,
              ease: "power2.in",
              transformOrigin: "100% 50%",
            },
            0,
          );
      });

      timeline.current = tl.progress(savedProgress.current);
    }, wrapperRef);

    setActive(active.current);

    return () => {
      savedProgress.current = timeline.current?.progress() ?? 0;
      timeline.current = null;
      ctx.revert();
    };
  }, [layout]);

  const arrows = layout ? arrowPaths(layout) : [];
  const stroke = layout ? layout.unit * 0.085 : 0;
  const head = layout ? layout.unit * 0.22 : 0;

  return (
    <div
      ref={wrapperRef}
      className="relative text-[clamp(1.5rem,6vw,3rem)] font-bold text-primary"
    >
      {/* Tight leading keeps the box snug to the letters, so its edges can
          stand in for the text's edges. */}
      <h1
        ref={titleRef}
        className="whitespace-nowrap leading-tight"
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setActive(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "touch") setActive(false);
        }}
        onPointerUp={(e) => {
          if (e.pointerType === "touch") setActive(!active.current);
        }}
      >
        Daniel &quot;Ludo&quot; DeAnda
      </h1>

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <marker
            id={MARKER_ID}
            markerUnits="userSpaceOnUse"
            orient="auto"
            overflow="visible"
          >
            <path d={`M${-head} ${-head * 0.7} L0 0 L${-head} ${head * 0.7}`} />
          </marker>
        </defs>

        {arrows.map((d, i) => (
          <g key={i} data-arrow opacity={0}>
            <path data-body d={d} />
            {/*
              A marker only ever sits at the end of the path that carries it,
              so the head rides on its own tiny carrier path: the outer group
              travels along the body while the carrier scales in.
            */}
            <g data-tip>
              <path
                data-head
                d="M-0.01 0 L0 0"
                markerEnd={`url(#${MARKER_ID})`}
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
