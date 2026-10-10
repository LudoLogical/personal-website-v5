import { twMerge } from "tailwind-merge";
import Logo, { type LogoProps } from "@/components/Logo";
import styles from "./AnimatedLogo.module.css";

export type AnimatedLogoProps = LogoProps;

/**
 * Renders the brand icon (see Logo) such that, while its parent (e.g., a home
 * link) is hovered or keyboard-focused, the arrow winds up and strikes the D,
 * which recoils and then settles back into place. Motionless if the user
 * prefers reduced motion. Like Logo, hidden from assistive technology by
 * default since its parent is expected to supply the label.
 *
 * Animated with CSS keyframes alone and thus valid as a server component.
 */
const AnimatedLogo = ({ className, ...props }: AnimatedLogoProps) => (
  <Logo
    {...props}
    // Sized to match the native dimensions of the artwork (44×37)
    className={twMerge(styles.root, "h-9.25 w-11", className)}
  />
);

export default AnimatedLogo;
