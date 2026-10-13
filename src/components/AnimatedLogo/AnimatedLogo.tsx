"use client";

import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import Logo, { type LogoProps } from "@/components/Logo";
import styles from "./AnimatedLogo.module.css";

export type AnimatedLogoProps = Omit<LogoProps, "ref">;

/**
 * Renders the brand icon (see Logo) such that, while its parent (e.g., a home
 * link) is hovered, the arrow winds up and strikes the D, which recoils and
 * then settles back into place. Each tap (or pen press) on the parent replays
 * the animation, even though touch devices keep the parent hovered between
 * taps. Motionless if the user prefers reduced motion. Like Logo, hidden from
 * assistive technology by default since its parent is expected to supply the
 * label.
 */
const AnimatedLogo = ({ className, ...props }: AnimatedLogoProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Restarts the CSS animations, which would otherwise play only once while
  // the parent stays hovered after a tap. Does nothing if the parent isn't
  // hovered yet (the hover itself starts them) or the user prefers reduced
  // motion (there are no animations)
  useEffect(() => {
    const svg = svgRef.current;
    const parent = svg?.parentElement;
    if (!svg || !parent) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      for (const animation of svg.getAnimations({ subtree: true })) {
        animation.currentTime = 0;
      }
    };
    parent.addEventListener("pointerdown", onPointerDown);
    return () => parent.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <Logo
      {...props}
      ref={svgRef}
      // Sized to match the native dimensions of the artwork (44×37)
      className={twMerge(styles.root, "h-9.25 w-11", className)}
    />
  );
};

export default AnimatedLogo;
