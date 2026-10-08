import { Mail } from "lucide-react";
import type { ComponentType } from "react";
import {
  FaCodepen,
  FaDiscord,
  FaGithub,
  FaLinkedin,
  FaReddit,
} from "react-icons/fa6";
import ExternalLink from "@/components/ExternalLink";
import Logo from "@/components/Logo";

type FooterLink = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

type FooterLinkGroup = {
  title: string;
  links: FooterLink[];
};

// Ordered from most formal to most casual
// TODO: Replace the placeholder URLs below with the real ones
const LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Contact",
    links: [
      { label: "Email", href: "mailto:TODO@example.com", icon: Mail },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/TODO",
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
      { label: "CodePen", href: "https://codepen.io/TODO", icon: FaCodepen },
    ],
  },
  {
    title: "Community",
    links: [
      {
        label: "Discord",
        href: "https://discord.com/users/TODO",
        icon: FaDiscord,
      },
      {
        label: "Reddit",
        href: "https://www.reddit.com/user/TODO",
        icon: FaReddit,
      },
    ],
  },
];

const linkClassName =
  "inline-flex items-center gap-2 transition-colors hover:text-base-content/85";

/**
 * Renders the site footer, styled as if engraved into a surface that lies
 * underneath the rest of the page. Remains stuck to the bottom of the viewport
 * so that it is revealed as the page above it scrolls away.
 */
const SiteFooter = () => (
  <footer className="sticky bottom-0 z-0 mx-auto footer max-w-5xl grid-cols-2 gap-y-10 px-8 pt-14 pb-12 text-base-content/55 engraved sm:grid-cols-4">
    <aside className="col-span-2 gap-3 sm:col-span-1">
      <Logo className="size-12 opacity-60" />
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <span className="whitespace-nowrap">
          Daniel &quot;Ludo&quot; DeAnda
        </span>
      </p>
    </aside>
    {LINK_GROUPS.map(({ title, links }) => (
      <nav key={title} aria-label={title}>
        <h2 className="footer-title">{title}</h2>
        {links.map(({ label, href, icon: Icon }) => {
          const content = (
            <>
              <Icon aria-hidden className="size-4" />
              {label}
            </>
          );
          return href.startsWith("mailto:") ? (
            <a key={label} href={href} className={linkClassName}>
              {content}
            </a>
          ) : (
            <ExternalLink key={label} href={href} className={linkClassName}>
              {content}
            </ExternalLink>
          );
        })}
      </nav>
    ))}
  </footer>
);

export default SiteFooter;
