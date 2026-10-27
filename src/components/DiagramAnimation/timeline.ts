import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type {
  default as DiagramAnimation,
  DiagramAnimationOptions,
} from "./DiagramAnimation";
import type { MarkerShape, RasterizedArrow } from "./types";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/**
 * Adds the animations for the specified `arrow` `Element` (including
 * its body, arrowhead, and any markers) to the specified {@link gsap.core.Timeline}.
 * @param arrow the `Element` containing the SVG for the arrow to be animated
 * @param timeline the {@link gsap.core.Timeline} to which the animations should be added
 * @param animationOptions the `options.animation` for the
 *                         associated {@link DiagramAnimation}
 */
const animateArrow = (
  arrow: Element,
  timeline: gsap.core.Timeline,
  animationOptions: DiagramAnimationOptions["animation"],
) => {
  const body = arrow.querySelector<SVGPathElement>("[data-body]")!;
  const carrier = arrow.querySelector("[data-carrier]")!;
  const arrowhead = arrow.querySelector("[data-arrowhead]")!;

  timeline
    // Fade the entire arrow in
    .fromTo(
      arrow,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: animationOptions.fadeInDuration, ease: "none" },
      0,
    )
    // Draw the body from tail to tip
    .fromTo(body, { drawSVG: "0%" }, { drawSVG: "100%" }, 0)
    // Move the arrowhead along the body; note that the path can be followed
    // as-is because the carrier exists within the same coordinate space as
    // the body, so there's no need for the `align` option
    .fromTo(
      carrier,
      // Override GSAP's default origin (the top-left corner of the bounding
      // box, not the origin in the SVG's own coordinate space) from the start
      // so the arrowhead rotates around its tip
      { svgOrigin: "0 0" },
      { motionPath: { path: body, autoRotate: true } },
      0,
    )
    // Scale the arrowhead up from nothing
    .fromTo(
      arrowhead,
      // Set origin from the start so GSAP doesn't offset the
      // arrowhead to keep it in place and knock its tip off the path
      { scale: 0, transformOrigin: "100% 50%" }, // grow out from arrowhead tip
      {
        scale: 1,
        duration:
          animationOptions.forwardDuration *
          animationOptions.headGrowthDuration,
        ease: "power2.in",
      },
      0,
    );

  // Scale each marker up from nothing
  for (const marker of arrow.querySelectorAll("[data-marker]")) {
    timeline.fromTo(
      marker,
      // Set origin from the start so GSAP doesn't offset the marker
      { scale: 0, transformOrigin: "50% 50%" }, // grow out from center
      { scale: 1 },
      0,
    );
  }
};

/**
 * The controls returned by `useDiagramAnimationTimeline()`.
 */
export type DiagramAnimationTimelineControls = {
  /**
   * Plays the animation forward (if the specified `value` is `true`) or
   * in reverse (if the specified `value` is `false`). Snaps immediately
   * to the appropriate end state if the user `prefers-reduced-motion`.
   */
  setActive: (value: boolean) => void;

  /**
   * Calls `setActive` with the opposite of the most recently specified `value`.
   */
  toggleActive: () => void;
};

/**
 * Animates the diagram elements within the specified SVG.
 * Rebuilds the animation whenever the specified paths or `animationOptions` change. Progress is preserved across builds so that
 * mid-animation interruptions do not cause jumps.
 * @param svgRef a `RefObject` for the SVG `Element` to be animated
 * @param arrowheadPath the arrowhead path rendered in the SVG;
 *                      passed to trigger a rebuild when changed
 * @param arrows the {@link RasterizedArrow}s rendered in the SVG;
 *               passed to trigger a rebuild when changed
 * @param markerPaths the marker paths rendered in the SVG;
 *                    passed to trigger a rebuild when changed
 * @param animationOptions the `options.animation` for the
 *                         associated {@link DiagramAnimation}
 * @returns the {@link DiagramAnimationTimelineControls} for the animation
 */
export const useDiagramAnimationTimeline = (
  svgRef: RefObject<Element | null>,
  arrowheadPath: string | null,
  arrows: RasterizedArrow[] | null,
  markerPaths: Record<MarkerShape, string> | null,
  animationOptions: DiagramAnimationOptions["animation"],
): DiagramAnimationTimelineControls => {
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const active = useRef(false); // active ? animate in : animate out
  const savedProgress = useRef(0); // Used only when rebuilding

  // Extracted so that the memo below doesn't depend on other `animationOptions`
  const { backwardSpeedup } = animationOptions;
  // Memoized so that the layout effect below can depend on it
  const setActive = useCallback(
    (isActive: boolean) => {
      active.current = isActive;
      const tl = timeline.current;
      if (!tl) return;

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tl.pause().progress(isActive ? 1 : 0); // skip the animation
      } else if (isActive) {
        tl.timeScale(1).play();
      } else {
        tl.timeScale(backwardSpeedup).reverse();
      }
    },
    [backwardSpeedup],
  );

  const toggleActive = () => setActive(!active.current);

  useLayoutEffect(() => {
    // Wait until the SVG is renderable
    if (!arrows || !arrowheadPath || !markerPaths) return;

    const gsapContext = gsap.context((self) => {
      // Create a new, empty timeline
      const tl = gsap.timeline({
        paused: true,
        defaults: {
          duration: animationOptions.forwardDuration,
          ease: "power2.inOut",
        },
      });
      // Animate all of the arrows
      for (const arrow of self.selector!("[data-arrow]")) {
        animateArrow(arrow, tl, animationOptions);
      }
      // Render the end state once so that every tween initializes now rather
      // than on first play, then pick up where the previous timeline left off
      timeline.current = tl
        .progress(1, true)
        .progress(savedProgress.current, true);
    }, svgRef);

    // Set the new timeline in motion
    setActive(active.current);

    return () => {
      // When it's time to rebuild (or unmount)...
      savedProgress.current = timeline.current?.progress() ?? 0;
      timeline.current = null;
      gsapContext.revert(); // reset the SVG to baseline
    };
  }, [arrows, arrowheadPath, markerPaths, animationOptions, svgRef, setActive]);

  return { setActive, toggleActive };
};
