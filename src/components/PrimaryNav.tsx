"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useHideOnScrollDown } from "@/utils/useHideOnScrollDown";

const NAV_ITEMS = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
  { label: "Extras", href: "/extras" },
  { label: "About", href: "/about" },
];

/**
 * Renders the primary navigation bar, which floats at the top of the viewport.
 * Slides out of view when the user scrolls down and back into view when the
 * user scrolls up (or moves keyboard focus into it), but stays in view while
 * its dropdown menu (shown in place of its links on narrow viewports) is open.
 */
const PrimaryNav = () => {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const hidden = useHideOnScrollDown(headerRef);
  const pathname = usePathname();

  const items = NAV_ITEMS.map(({ label, href }) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={active ? "menu-active" : undefined}
          // Client-side navigation keeps this component mounted, so the
          // dropdown menu has to be closed explicitly after a selection
          onClick={() => menuRef.current?.hidePopover()}
        >
          {label}
        </Link>
      </li>
    );
  });

  return (
    // Only the bar itself captures pointer events, not the surrounding gutters
    <header
      ref={headerRef}
      data-hidden={hidden || undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-6 pt-6 transition-transform duration-300 ease-out data-hidden:not-has-focus-visible:not-has-[:popover-open]:-translate-y-[calc(100%+1rem)] motion-reduce:transition-none"
    >
      <nav
        aria-label="Primary"
        className="pointer-events-auto navbar mx-auto max-w-5xl rounded-xl border border-base-content/10 bg-base-200/75 shadow-lg backdrop-blur-md [anchor-name:--primary-nav]"
      >
        <div className="m-3 navbar-start w-auto">
          <Link href="/" aria-label="Home" className="rounded-md">
            <AnimatedLogo className="my-0.5 h-11 w-auto" />
          </Link>
        </div>
        <div className="m-2 navbar-end grow">
          <ul className="menu menu-horizontal hidden gap-1 text-base sm:flex">
            {items}
          </ul>
          {/* A popover (rather than daisyUI's focus-based dropdown) so that
              the button natively exposes whether the menu is expanded, and so
              that Esc and clicking outside of the menu both close it. Via CSS
              anchor positioning, the menu sits below the button but lines up
              with the right edge of the whole nav bar (rather than the
              button's). It's anchored to this wrapper rather than the button
              itself because the button shifts down by 0.5px while pressed
              (daisyUI's btn:active translate), which the menu would otherwise
              follow; the wrapper (flex, so that it hugs the button) stays put.
              Its insets replace daisyUI's position-area, which can
              only align it to a single anchor. Browsers without anchor
              positioning get the same position relative to the viewport
              instead: the header's px-6 from the right, and from the top, the
              header's pt-6 + the nav's 1px border + the navbar's 0.5rem
              padding + the wrapper's m-2 + the btn-xl height (daisyUI's own
              formula), all of which must be kept in sync with the fallback.
              Unlike a focus-based dropdown, a popover stays open when focus
              leaves it, so it's closed explicitly to keep it from covering
              whatever receives focus next. Ignores blurs with no new target
              (e.g., switching windows) since there's nothing to cover */}
          <div
            className="group/dropdown flex [anchor-name:--primary-nav-dropdown] sm:hidden"
            onBlur={(e) => {
              if (
                e.relatedTarget &&
                !e.currentTarget.contains(e.relatedTarget)
              ) {
                menuRef.current?.hidePopover();
              }
            }}
          >
            {/* Swaps the hamburger icon for an X while the menu is open */}
            <button
              type="button"
              popoverTarget="primary-nav-menu"
              aria-label="Navigation menu"
              className="btn swap btn-circle swap-rotate btn-ghost btn-xl group-has-[:popover-open]/dropdown:swap-active"
            >
              <Menu aria-hidden className="size-6 swap-off" />
              <X aria-hidden className="size-6 swap-on" />
            </button>
            <ul
              ref={menuRef}
              id="primary-nav-menu"
              popover="auto"
              className="menu dropdown top-[anchor(--primary-nav-dropdown_bottom)] right-[anchor(--primary-nav_right)] bottom-auto left-auto mt-6 w-44 rounded-xl border border-base-content/10 bg-base-200 p-2 text-base shadow-lg [position-area:none] not-supports-[anchor-name:--primary-nav]:top-[calc(--spacing(6)+1px+0.5rem+(--spacing(2))+var(--size-field,0.25rem)*14)] not-supports-[anchor-name:--primary-nav]:right-6"
            >
              {items}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default PrimaryNav;
