"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mulish } from "next/font/google";

const mulish = Mulish({ subsets: ["latin"], weight: ["800"] });

const WORD = "Sense-Maker";
// Vertical position (px, within the 48px line) of each dot, one per letter.
const DOT_Y = [30, 12, 36, 18, 28, 40, 8, 24, 14, 34, 20];

const INK = "oklch(0.22 0.01 80)";
const FADED = "oklch(0.86 0.006 80)";
const ACCENT = "oklch(0.6 0.17 45)";

type Point = { x: number; y: number };

export default function ConnectTheDots({
  className = "",
}: {
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [width, setWidth] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    setWidth(wrap.offsetWidth);
    setPoints(
      letterRefs.current.map((el, i) => ({
        x: el ? Math.round(el.offsetLeft + el.offsetWidth / 2) : 0,
        y: DOT_Y[i % DOT_Y.length],
      })),
    );
  }, []);

  useEffect(() => {
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

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
      className={`${mulish.className} relative inline-block cursor-default text-[48px] leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap outline-none ${className}`}
    >
      <span
        aria-hidden="true"
        className="motion-reduce:transition-none!"
        style={{
          color: active ? FADED : INK,
          transition: "color 400ms ease-out",
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
        width={width}
        height={48}
        className="pointer-events-none absolute top-0 left-0 overflow-visible"
      >
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          pathLength={1}
          fill="none"
          stroke={ACCENT}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={1}
          strokeDashoffset={active ? 0 : 1}
          className="motion-reduce:transition-none!"
          style={{
            transition: active
              ? `stroke-dashoffset 900ms ${ease} 520ms` // draw after text has faded
              : `stroke-dashoffset 450ms ${ease} 0ms`, // retract immediately
          }}
        />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4.5}
            fill={ACCENT}
            className="motion-reduce:transition-none!"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: active ? "scale(1)" : "scale(0)",
              transition: "transform 240ms cubic-bezier(.3,1.6,.5,1)",
              // In: left→right after the fade. Out: right→left, done by ~640ms.
              transitionDelay: active
                ? `${400 + i * 30}ms`
                : `${150 + (n - 1 - i) * 25}ms`,
            }}
          />
        ))}
      </svg>
    </span>
  );
}
