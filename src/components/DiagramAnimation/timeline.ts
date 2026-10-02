import { useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import {
  FORWARD_DURATION,
  FADE_IN_DURATION,
  HEAD_GROW,
  BACKWARD_SPEEDUP,
} from "./config";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/**
 * Adds the animations for the specified arrow to the specified Timeline.
 * @param arrow the Element containing the SVG for the arrow to be animated
 * @param timeline the GSAP Timeline to which the animations should be added
 */
const animateArrow = (arrow: Element, timeline: gsap.core.Timeline) => {
  const body = arrow.querySelector<SVGPathElement>("[data-body]")!;
  const tip = arrow.querySelector("[data-tip]")!; // carrier for the head
  const head = arrow.querySelector("[data-head]")!;

  timeline
    // Fade the entire arrow in
    .fromTo(
      arrow,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: FADE_IN_DURATION, ease: "none" },
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
        duration: FORWARD_DURATION * HEAD_GROW,
        ease: "power2.in",
        transformOrigin: `100% 50%`, // x y; grow out from arrowhead tip
      },
      0,
    );
};

export type DiagramAnimationTimelineControls = {
  setActive: (value: boolean) => void;
  toggleActive: () => void;
};

/**
 * Animates the diagram elements within the specified SVG.
 * Rebuilds the animation whenever the specified TextDimensions
 * change (since that implies that the SVG has also changed).
 * Progress is preserved across builds so that mid-animation
 * interruptions do not cause jumps.
 * @param svgRef a RefObject for the SVG Element to be animated
 * @param textDimensions the TextDimensions that trigger a rebuild on change
 * @returns the DiagramAnimationTimelineControls for the animation
 */
export const useDiagramAnimationTimeline = (
  svgRef: RefObject<Element | null>,
  textDimensions: unknown,
): DiagramAnimationTimelineControls => {
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const active = useRef(false); // active ? animate in : animate out
  const savedProgress = useRef(0); // Used only when rebuilding

  const setActive = (isActive: boolean) => {
    active.current = isActive;
    const tl = timeline.current;
    if (!tl) return;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tl.pause().progress(isActive ? 1 : 0); // skip to the final result
    } else if (isActive) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(BACKWARD_SPEEDUP).reverse();
    }
  };

  const toggleActive = () => setActive(!active.current);

  useLayoutEffect(() => {
    if (!textDimensions) return; // wait until the SVG is renderable

    const gsapContext = gsap.context((self) => {
      // Create a new, empty timeline
      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: FORWARD_DURATION, ease: "power2.inOut" },
      });
      // Animate all of the arrows
      for (const arrow of self.selector!("[data-arrow]")) {
        animateArrow(arrow, tl);
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
  }, [textDimensions, svgRef]);

  return { setActive, toggleActive };
};
