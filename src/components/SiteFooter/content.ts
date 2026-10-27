import { Mail } from "lucide-react";
import { ComponentType } from "react";
import {
  FaLinkedin,
  FaGithub,
  FaCodepen,
  FaDiscord,
  FaReddit,
} from "react-icons/fa6";
import type SiteFooter from "./SiteFooter";

/**
 * A link in the {@link SiteFooter}.
 */
type FooterLink = {
  /**
   * The text displayed as this {@link FooterLink}.
   */
  label: string;
  /**
   * The target URL of this {@link FooterLink}.
   */
  href: string;
  /**
   * The icon that should appear on the left side of this {@link FooterLink}.
   */
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

/**
 * A group of {@link FooterLink}s.
 */
type FooterLinkGroup = {
  /**
   * The text displayed as the header of this {@link FooterLinkGroup}.
   */
  title: string;
  /**
   * The {@link FooterLink}s in this {@link FooterLinkGroup}.
   */
  links: FooterLink[];
};

/**
 * The {@link FooterLinkGroup}s that should appear in the {@link SiteFooter}.
 */
export const LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Contact",
    links: [
      { label: "Email", href: "mailto:hello@danieldeanda.com", icon: Mail },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/danielchristiandeanda/",
        icon: FaLinkedin,
      },
    ],
  },
  {
    title: "Code",
    links: [
      {
        label: "GitHub",
        href: "https://github.com/LudoLogical",
        icon: FaGithub,
      },
      {
        label: "CodePen",
        href: "https://codepen.io/LudoLogical",
        icon: FaCodepen,
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "Discord",
        href: "https://discord.com/users/355536854176497668",
        icon: FaDiscord,
      },
      {
        label: "Reddit",
        href: "https://www.reddit.com/user/ludoislogical/",
        icon: FaReddit,
      },
    ],
  },
];
