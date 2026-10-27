import ExternalLink from "@/components/ExternalLink";
import Logo from "@/components/Logo";
import { LINK_GROUPS } from "./content";

/**
 * Renders the site-wide footer. Sticks to the bottom of the viewport so that
 * it is revealed as the page above it scrolls away to suggest that the footer
 * lies underneath the page.
 */
const SiteFooter = () => (
  // Switches from four rows to two rows (aside + nav)
  // to one row as the width of the viewport increases
  <footer
    className={`sticky bottom-0 z-0 mx-auto footer max-w-5xl grid-cols-1 justify-around justify-items-center gap-y-10 px-10 pt-14 pb-12 text-base-content/55 xxs:grid-cols-[repeat(3,auto)] sm:grid-cols-[repeat(4,auto)]`}
  >
    <aside className="col-span-full place-items-center gap-3 text-center sm:col-span-1 sm:place-items-start sm:text-left">
      <Logo className="size-12 opacity-60" />
      <p>
        &copy; {new Date().getFullYear()}
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
        // Center everything when fully stacked
        className="place-items-center xxs:place-items-start"
      >
        <h2 className="footer-title">{title}</h2>
        {links.map(({ label, href, icon: Icon }) => {
          return (
            <ExternalLink key={label} kind="highlight" href={href}>
              <Icon aria-hidden className="size-4" />
              {label}
            </ExternalLink>
          );
        })}
      </nav>
    ))}
  </footer>
);

export default SiteFooter;
