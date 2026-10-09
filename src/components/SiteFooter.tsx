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
  // Columns are sized to their contents and given equal space on either side
  // so that the gaps between sections stay even and everything stays
  // centered. Stacks every section until there's room for the link groups to
  // share a row (beneath the aside), then puts all four sections in one row
  <footer className="sticky bottom-0 z-0 mx-auto footer max-w-5xl grid-cols-1 justify-around justify-items-center gap-y-10 px-10 pt-14 pb-12 text-base-content/55 engraved xxs:grid-cols-[repeat(3,auto)] sm:grid-cols-[repeat(4,auto)]">
    <aside className="col-span-full place-items-center gap-3 text-center sm:col-span-1 sm:place-items-start sm:text-left">
      <Logo className="size-12 opacity-60" />
      <p>
        &copy; {new Date().getFullYear()}
        {/* Broken here to keep the aside about as narrow as the link groups */}
        <br />
        <span className="whitespace-nowrap">
          Daniel &quot;Ludo&quot; DeAnda
        </span>
      </p>
    </aside>
    {LINK_GROUPS.map(({ title, links }) => (
      <nav
        key={title}
        aria-label={title}
        // Centered along with everything else while stacked
        className="place-items-center xxs:place-items-start"
      >
        <h2 className="footer-title">{title}</h2>
        {links.map(({ label, href, icon: Icon }) => {
          const content = (
            <>
              <Icon aria-hidden className="size-4" />
              {label}
            </>
          );
          return (
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
