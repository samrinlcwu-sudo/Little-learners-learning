"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  links?: NavLink[];
}

/**
 * Renders just the brand mark when there are no real destinations to link to
 * yet — an empty nav (mobile toggle included) would be a broken affordance,
 * not a design flourish.
 */
function SiteHeader({ links = [] }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
          <Image
            src="/brand/little-learners-learning-logo.png"
            alt={siteConfig.name}
            width={40}
            height={40}
            priority
            className="size-10 w-auto object-contain"
          />
        </Link>

        {links.length > 0 && (
          <>
            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-8">
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

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-ink md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X className="size-6" aria-hidden="true" />
              ) : (
                <Menu className="size-6" aria-hidden="true" />
              )}
              <span className="sr-only">
                {mobileOpen ? "Close menu" : "Open menu"}
              </span>
            </button>
          </>
        )}
      </div>

      {links.length > 0 && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className={cn("border-t border-neutral-200 md:hidden", mobileOpen ? "block" : "hidden")}
        >
          <ul className="flex flex-col px-4 py-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block py-2.5 text-sm font-medium text-neutral-700 hover:text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export { SiteHeader };
