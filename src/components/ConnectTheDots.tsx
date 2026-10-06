"use client";

import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useTextDimensions } from "@/utils/useTextDimensions";

const WORD = "Sense-Maker";
// Vertical position (em, within the 1em line) of each dot, one per letter.
const DOT_Y = [30, 12, 36, 18, 28, 40, 8, 24, 14, 34, 20].map((y) => y / 48);

const STROKE_WIDTH = 0.085; // em — matches DiagramAnimation
const DOT_RADIUS = 0.12; // em

const INK = "var(--color-base-content)";
const FADED = "color-mix(in oklch, var(--color-base-content) 15%, transparent)";
const ACCENT = "var(--color-primary)";

const FADE_OUT_MS = 150; // text dims on hover; dots/line start once it's done

type Point = { x: number; y: number };

export default function ConnectTheDots({ className }: { className?: string }) {
  const [active, setActive] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dims = useTextDimensions(wrapRef);
  const em = dims?.em ?? 0;

  // Re-measure letter centres whenever the rendered text changes size
  // (font load, viewport resize, clamp() breakpoints).
  useEffect(() => {
    if (!dims) return;
    setPoints(
      letterRefs.current.map((el, i) => ({
        x: el ? Math.round(el.offsetLeft + el.offsetWidth / 2) : 0,
        y: DOT_Y[i % DOT_Y.length] * dims.em,
      })),
    );
  }, [dims]);

  const n = points.length;
  const ease = "cubic-bezier(.65,0,.25,1)";

  return (
    <span
      ref={wrapRef}
      tabIndex={0}
      aria-label={WORD}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={twMerge(
        "relative inline-block cursor-default outline-none",
        className,
      )}
    >
      {/* Leading set here so a caller's text-* class can't override it via twMerge */}
      <span
        aria-hidden="true"
        className="block leading-none whitespace-nowrap motion-reduce:transition-none!"
        style={{
          color: active ? FADED : INK,
          transition: `color ${active ? FADE_OUT_MS : 400}ms ease-out`,
          // Fade out immediately; fade back in only after the dots are gone.
          transitionDelay: active ? "0ms" : "650ms",
        }}
      >
        {[...WORD].map((ch, i) => (
          <span
            key={i}
            ref={(el) => {
              letterRefs.current[i] = el;
            }}
          >
            {ch}
          </span>
        ))}
      </span>

      <svg
        aria-hidden="true"
        width={dims?.width ?? 0}
        height={em}
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
      >
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          pathLength={1}
          fill="none"
          stroke={ACCENT}
          strokeWidth={STROKE_WIDTH * em}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={active ? 0 : 1}
          className="motion-reduce:transition-none!"
          style={{
            transition: active
              ? `stroke-dashoffset 900ms ${ease} ${FADE_OUT_MS + 120}ms` // draw after text has faded
              : `stroke-dashoffset 450ms ${ease} 0ms`, // retract immediately
          }}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={DOT_RADIUS * em}
            fill={ACCENT}
            className="motion-reduce:transition-none!"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: active ? "scale(1)" : "scale(0)",
              // Springy overshoot only on the way in — on the way out it would
              // overshoot past scale(0) and linger as a 1px speck.
              transition: active
                ? "transform 240ms cubic-bezier(.3,1.6,.5,1)"
                : "transform 180ms cubic-bezier(.5,0,.75,0)",
              // In: left→right after the fade. Out: right→left, done by ~640ms.
              transitionDelay: active
                ? `${FADE_OUT_MS + i * 30}ms`
                : `${150 + (n - 1 - i) * 25}ms`,
            }}
          />
        ))}
      </svg>
    </span>
  );
}
