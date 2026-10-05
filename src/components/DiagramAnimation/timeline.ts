import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { type DiagramAnimationOptions } from "./DiagramAnimation";
import { type MarkerShape, type RasterizedArrow } from "./types";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/**
 * Adds the animations for the specified arrow Element
 * (which includes both the arrow itself and any markers that belong to it)
 * to the specified Timeline.
 * @param arrow the Element containing the SVG for the arrow to be animated
 * @param timeline the GSAP Timeline to which the animations should be added
 * @param animationOptions the animation options for
 *                         the associated DiagramAnimation
 */
const animateArrow = (
  arrow: Element,
  timeline: gsap.core.Timeline,
  animationOptions: DiagramAnimationOptions["animation"],
) => {
  const body = arrow.querySelector<SVGPathElement>("[data-body]")!;
  const tip = arrow.querySelector("[data-tip]")!; // carrier for the head
  const head = arrow.querySelector("[data-head]")!;

  timeline
    // Fade the entire arrow in
    .fromTo(
      arrow,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: animationOptions.fadeInDuration, ease: "none" },
      0,
    )
    // Draw the main polyline from tail to tip
    .fromTo(body, { drawSVG: "0%" }, { drawSVG: "100%" }, 0)
    // Move the arrowhead along the main polyline
    .to(
      tip,
      {
        motionPath: {
          path: body,
          align: body,
          alignOrigin: [1, 0.5], // [x, y]; arrowhead tip is at top middle
          autoRotate: true,
        },
      },
      0,
    )
    // Scale the arrowhead up from nothing
    .fromTo(
      head,
      { scale: 0 },
      {
        scale: 1,
        duration: animationOptions.forwardDuration * animationOptions.headGrow,
        ease: "power2.in",
        transformOrigin: `100% 50%`, // x y; grow out from arrowhead tip
      },
      0,
    );

  // Scale each marker up from nothing
  for (const marker of arrow.querySelectorAll("[data-marker]")) {
    timeline.fromTo(
      marker,
      // Set origin from the start so GSAP doesn't touch it
      { scale: 0, transformOrigin: "50% 50%" }, // grow out from center
      { scale: 1 },
      0,
    );
  }
};

export type DiagramAnimationTimelineControls = {
  setActive: (value: boolean) => void;
  toggleActive: () => void;
};

/**
 * Animates the diagram elements within the specified SVG.
 * Rebuilds the animation whenever the
 * specified paths or animation options change.
 * Progress is preserved across builds so that
 * mid-animation interruptions do not cause jumps.
 * @param svgRef a RefObject for the SVG Element to be animated
 * @param arrowheadPath the arrowhead path rendered in the SVG;
 *                      passed to trigger a rebuild when changed
 * @param arrows the RasterizedArrows rendered in the SVG;
 *               passed to trigger a rebuild when changed
 * @param markerPaths the marker paths rendered in the SVG;
 *                    passed to trigger a rebuild when changed
 * @param animationOptions the animation options for
 *                         the associated DiagramAnimation
 * @returns the DiagramAnimationTimelineControls for the animation
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

  // Memoized so that the layout effect below can depend on it
  const { backwardSpeedup } = animationOptions;
  const setActive = useCallback(
    (isActive: boolean) => {
      active.current = isActive;
      const tl = timeline.current;
      if (!tl) return;

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tl.pause().progress(isActive ? 1 : 0); // skip to the final result
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
      // Pick up where the previous timeline left off
      timeline.current = tl.progress(savedProgress.current);
    }, svgRef);

    // Set the new timeline in motion
    setActive(active.current);

    return () => {
      // When it's time to rebuild...
      savedProgress.current = timeline.current?.progress() ?? 0;
      timeline.current = null;
      gsapContext.revert(); // reset the SVG to baseline
    };
  }, [arrows, arrowheadPath, markerPaths, animationOptions, svgRef, setActive]);

  return { setActive, toggleActive };
};
