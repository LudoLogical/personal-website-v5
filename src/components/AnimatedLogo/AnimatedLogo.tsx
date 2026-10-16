"use client";

import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import Logo, { type LogoProps } from "@/components/Logo";
import styles from "./AnimatedLogo.module.css";

export type AnimatedLogoProps = Omit<LogoProps, "ref">;

/**
 * Renders the Logo such that, while its parent is hovered (or, on touch
 * screens, every time that its parent is tapped), the arrow strikes the D,
 * causing it to teeter, recoil, and then settle back into place.
 * Motionless if the user `prefers-reduced-motion`.
 *
 * Note: Like Logo, this component is hidden from ATs, so its parent is
 * responsible for supplying a label if one is necessary.
 */
const AnimatedLogo = ({ className, ...props }: AnimatedLogoProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // On touch screens, the parent stays "hovered" after being tapped,
  // so tapping it again doesn't cause the CSS animations to play again.
  // This useEffect() fixes that by restarting the animations manually.
  useEffect(() => {
    const svg = svgRef.current;
    const parent = svg?.parentElement;
    if (!svg || !parent) return; // Both Elements must exist
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return; // Touch screens only
      for (const animation of svg.getAnimations({ subtree: true })) {
        animation.currentTime = 0; // Reset *everything* to 0
      }
    };
    parent.addEventListener("pointerdown", onPointerDown);
    return () => parent.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <Logo
      {...props}
      ref={svgRef}
      className={twMerge(styles.root, "", className)}
    />
  );
};

export default AnimatedLogo;
