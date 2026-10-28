import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import useGapMidpoint from "@/utils/useGapMidpoint";
import Iceberg from "./Iceberg";
import type { IcebergExplainerTextProps } from "./IcebergExplainerText";
import { NUM_LEVELS, type Level, type Levels } from "./levels";

/**
 * The background and text color classes for each {@link Level}'s panel,
 * in order from top (the surface) to bottom (the deepest level).
 */
const LEVEL_CLASS_NAMES: [string, string, string, string] = [
  "bg-blue-200 text-blue-950",
  "bg-blue-400 text-blue-950",
  "bg-blue-700 text-blue-50",
  "bg-blue-950 text-blue-100",
];

export type LevelPanelsProps = {
  /**
   * The four {@link Level}s in this {@link LevelPanels},
   * in order from top (the surface) to bottom (the deepest level).
   */
  levels: Levels;

  /**
   * The index of the {@link Level} whose panel
   * this {@link LevelPanels} should display.
   */
  currentLevel: number;

  /**
   * The duration and easing curve according to which this
   * {@link LevelPanels} should scroll between panels,
   * expressed as a partial CSS `transition` value.
   */
  scrollTransition: string;

  /**
   * Classes for each of the {@link Level} panels.
   * Applied after the panel's background classes.
   */
  panelClassName?: string;

  /**
   * Classes for the text in each of the {@link Level} panels.
   */
  textClassNames?: NonNullable<
    IcebergExplainerTextProps["childClassNames"]
  >["text"];
};

/**
 * Renders a sliding strip of panels for each of four {@link Level}s,
 * exactly one of which is shown at a time. A single `Iceberg` spans
 * the backgrounds of all four panels, which get progressively darker
 * from top to bottom.
 */
const LevelPanels = ({
  levels,
  currentLevel,
  scrollTransition,
  panelClassName,
  textClassNames,
}: LevelPanelsProps) => {
  const stripRef = useRef<HTMLSpanElement>(null);

  // Position the waterline between the question and concepts
  const questionRef = useRef<HTMLSpanElement>(null);
  const conceptsRef = useRef<HTMLSpanElement>(null);
  const waterline = useGapMidpoint(questionRef, conceptsRef);

  // Derive the height of each panel from
  // the (natural) height of the entire strip
  const [stripHeight, setStripHeight] = useState<number | null>(null);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const observer = new ResizeObserver(() =>
      setStripHeight(strip.offsetHeight),
    );
    observer.observe(strip);
    return () => observer.disconnect(); // destroy `observer` on cleanup
  }, []); // run only once per mount
  const panelHeight = stripHeight === null ? null : stripHeight / NUM_LEVELS;

  return (
    <span
      className="flex-1 overflow-hidden"
      style={{ height: panelHeight ?? undefined }}
    >
      {/* `auto-rows-fr` makes every panel as tall as the tallest one */}
      <span
        ref={stripRef}
        className="relative grid auto-rows-fr motion-reduce:transition-none!"
        style={{
          transform: `translateY(${(-currentLevel * 100) / NUM_LEVELS}%)`,
          transition: `transform ${scrollTransition}`,
        }}
      >
        {stripHeight !== null && (
          <Iceberg height={stripHeight} waterline={waterline} />
        )}
        {levels.map(({ depth, name, question, concepts }, i) => (
          <span
            key={i}
            className={twMerge(
              // `*:relative` lets the children go above the iceberg
              "flex flex-col gap-1 px-4 pt-3 pb-4 whitespace-nowrap *:relative",
              LEVEL_CLASS_NAMES[i],
              panelClassName,
            )}
          >
            <span
              className={twMerge(
                "font-mono text-[10px]",
                textClassNames?.depth,
              )}
            >
              {depth}
            </span>
            <span
              className={twMerge("text-lg font-bold", textClassNames?.name)}
            >
              {name}
            </span>
            {/* Refs go on the first panel only */}
            <span
              ref={i === 0 ? questionRef : undefined}
              className={twMerge("text-xs italic", textClassNames?.question)}
            >
              {question}
            </span>
            <span
              ref={i === 0 ? conceptsRef : undefined}
              className={twMerge("text-xs", textClassNames?.concepts)}
            >
              {concepts.join(" · ")}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
};

export default LevelPanels;
