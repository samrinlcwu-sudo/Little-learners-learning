"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import { primaryNav, type NavLink } from "@/config/nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export interface SiteHeaderProps {
  links?: NavLink[];
}

/**
 * Search and Log in/Sign up are rendered disabled with an explicit "coming
 * soon" label — reserving the layout space the product will need without
 * pretending auth or search already work.
 */
function HeaderActions({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title="Search — coming soon"
        className="inline-flex size-11 items-center justify-center rounded-md text-neutral-400 disabled:cursor-not-allowed"
      >
        <Search className="size-5" aria-hidden="true" />
        <span className="sr-only">Search (coming soon)</span>
      </button>
      <Button variant="ghost" size="sm" disabled title="Coming soon">
        Log in
      </Button>
      <Button variant="primary" size="sm" disabled title="Coming soon">
        Sign up
      </Button>
    </div>
  );
}

function SiteHeader({ links = primaryNav }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  // Close the mobile drawer if the viewport grows past the mobile breakpoint.
  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setMobileOpen(false);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
        >
          <Image
            src="/brand/little-learners-learning-logo.png"
            alt={siteConfig.name}
            width={40}
            height={40}
            priority
            className="size-10 w-auto object-contain"
          />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-neutral-700 transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <HeaderActions className="hidden md:flex" />

        <button
          ref={toggleRef}
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
        </button>
      </div>

      <div
        className={cn(
          "grid border-neutral-200 transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none md:hidden",
          mobileOpen ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <nav id="mobile-nav" aria-label="Primary" inert={!mobileOpen || undefined}>
            <div className="relative px-4 pt-3">
              <Search
                className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <input
                type="search"
                disabled
                placeholder="Search — coming soon"
                aria-label="Search (coming soon)"
                className="h-11 w-full rounded-md border border-neutral-200 bg-neutral-100 pl-9 pr-3 text-sm text-neutral-400 placeholder:text-neutral-400 disabled:cursor-not-allowed"
              />
            </div>
            <ul className="flex flex-col px-4 py-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-3 text-base font-medium text-neutral-700 hover:text-ink"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-neutral-200 px-4 py-4">
              <Button variant="outline" disabled title="Coming soon" className="w-full">
                Log in
              </Button>
              <Button variant="primary" disabled title="Coming soon" className="w-full">
                Sign up
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export { SiteHeader };
