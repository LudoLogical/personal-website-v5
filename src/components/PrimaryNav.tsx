"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import Logo from "@/components/Logo";
import { useHideOnScrollDown } from "@/utils/useHideOnScrollDown";

const NAV_ITEMS = [
  { label: "Work", href: "/work" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
  { label: "Extras", href: "/extras" },
  { label: "About", href: "/about" },
];

/**
 * Releases focus from the mobile dropdown so that it closes after a selection.
 */
const closeDropdown = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

/**
 * Renders the primary navigation bar, which floats at the top of the viewport.
 * Slides out of view when the user scrolls down and back into view when the
 * user scrolls up (or moves keyboard focus into it).
 */
const PrimaryNav = () => {
  const headerRef = useRef<HTMLElement>(null);
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
          onClick={closeDropdown}
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
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 transition-transform duration-300 ease-out data-hidden:not-has-focus-visible:-translate-y-[calc(100%+1rem)] motion-reduce:transition-none"
    >
      <nav
        aria-label="Primary"
        className="pointer-events-auto navbar mx-auto max-w-5xl rounded-3xl border border-base-content/10 bg-base-200/75 px-4 shadow-lg backdrop-blur-md"
      >
        <div className="my-1 navbar-start w-auto">
          <Link href="/" aria-label="Home" className="rounded-md p-2">
            <Logo className="my-0.5 h-11 w-auto" />
          </Link>
        </div>
        <div className="navbar-end grow">
          <ul className="menu menu-horizontal hidden gap-1 text-base md:flex">
            {items}
          </ul>
          <div className="dropdown dropdown-end md:hidden">
            <div
              tabIndex={0}
              role="button"
              aria-label="Open navigation menu"
              className="btn btn-square btn-ghost"
            >
              <Menu aria-hidden className="size-6" />
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content z-10 mt-3 w-44 rounded-box border border-base-content/10 bg-base-200 p-2 text-base shadow-lg"
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
