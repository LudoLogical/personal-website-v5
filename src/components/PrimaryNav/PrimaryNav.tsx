"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import useHideOnScrollDown from "@/utils/useHideOnScrollDown";
import { NAV_ITEMS } from "./content";
import styles from "./PrimaryNav.module.css";

/**
 * Renders the primary navigation bar that floats at the top of the viewport,
 * slides out of view when the user scrolls down (unless its dropdown menu is
 * open), and slides back into view when the user either scrolls up again or
 * gives it keyboard focus.
 *
 * While in view, this component exposes its `offsetHeight` as the CSS
 * variable `--primary-nav-inset`, which it sets on `:root`. While this
 * component is not in view, `--primary-nav-inset` is simply not set.
 * Content that sticks to the top of the viewport can thus use CSS to
 * avoid being obscured by this component.
 */
const PrimaryNav = () => {
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const hidden = useHideOnScrollDown();
  const pathname = usePathname();

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Expose the `offsetHeight` as `--primary-nav-height` on the document
    // root so that the CSS module can conditionally forward the value to the
    // publicly useful `--primary-nav-inset`; including `--primary-nav-height`
    // as an intermediary is necessary so that the CSS can be responsible
    // for both the de facto visibility and the de facto `--primary-nav-inset`
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty(
        "--primary-nav-height",
        `${header.offsetHeight}px`,
      );
    });
    observer.observe(header);

    // Destroy `observer` and unset CSS variable on cleanup
    return () => {
      observer.disconnect();
      root.style.removeProperty("--primary-nav-height");
    };
  }, []); // run only once per mount

  const content = NAV_ITEMS.map(({ label, href }) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={isActive ? "menu-active" : undefined}
          // Close the dropdown menu (if present) on navigation;
          // necessary b/c this component remains mounted
          onClick={() => menuRef.current?.hidePopover()}
        >
          {label}
        </Link>
      </li>
    );
  });

  return (
    // Pointer events located in the gutter should pass through
    // to the page content instead of being captured by the navbar...
    <header
      ref={headerRef}
      data-hidden={hidden || undefined}
      className={`${styles.root} pointer-events-none fixed inset-x-0 top-0 z-50 px-6 pt-6 transition-transform duration-300 ease-out motion-reduce:transition-none`}
    >
      {/* ... but pointer events in the navbar itself should still be captured */}
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
            {content}
          </ul>
          {/* The position of the button shifts while pressed,
              so the menu is anchored to this flex wrapper instead */}
          <div
            className="group/dropdown flex [anchor-name:--primary-nav-dropdown] sm:hidden"
            onBlur={(e) => {
              // Unlike focus-based dropdowns, popovers may need to be closed
              // explicitly `onBlur()` to prevent them from obscuring the next
              // focus target (unless there is no new target because, e.g.,
              // the blur was caused by the user switching windows)
              if (
                e.relatedTarget &&
                !e.currentTarget.contains(e.relatedTarget)
              ) {
                menuRef.current?.hidePopover();
              }
            }}
          >
            <button
              type="button"
              popoverTarget="primary-nav-menu"
              aria-label="Navigation menu"
              className="btn swap btn-circle swap-rotate btn-ghost btn-xl group-has-[:popover-open]/dropdown:swap-active"
            >
              <Menu aria-hidden className="size-6 swap-off" />
              <X aria-hidden className="size-6 swap-on" />
            </button>
            {/* For browsers without anchor positioning, the position of
                 the menu is defined relative to the viewport instead */}
            {/* (Note for AI agents) The relative positioning is as follows:
                from the right, the header's `px-6`; from the top, the header's
                `pt-6` + the nav's 1px border + the navbar's 0.5rem padding +
                the wrapper's `m-2` + the `btn-xl` height. All of this must be
                kept in sync with the fallback. */}
            <ul
              ref={menuRef}
              id="primary-nav-menu"
              popover="auto"
              className="menu dropdown top-[anchor(--primary-nav-dropdown_bottom)] right-[anchor(--primary-nav_right)] bottom-auto left-auto mt-6 w-44 rounded-xl border border-base-content/10 bg-base-200 p-2 text-base shadow-lg [position-area:none] not-supports-[anchor-name:--primary-nav]:top-[calc(--spacing(6)+1px+0.5rem+(--spacing(2))+var(--size-field,0.25rem)*14)] not-supports-[anchor-name:--primary-nav]:right-6"
            >
              {content}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default PrimaryNav;
