"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Menu, X } from "lucide-react";
import { AdminNavLinks } from "@/components/patterns/admin-nav-links";
import { AdminNotificationBell } from "@/components/patterns/admin-notification-bell";
import { AdminAccountMenu } from "@/components/patterns/admin-account-menu";
import { cn } from "@/lib/utils/cn";

/**
 * The admin top bar (Prompt 64): brand mark, a mobile nav toggle (the
 * sidebar in `AdminSidebar` is `hidden` below `lg`, so this is the only
 * way to reach Users/Teachers on a phone or tablet), the notification
 * bell, and the account menu. The collapsible panel below the bar mirrors
 * `SiteHeader`'s exact grid-rows collapse technique (`src/components/layout/site-header.tsx`)
 * so mobile nav behaves identically everywhere in this app.
 */
function AdminHeader() {
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

  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setMobileOpen(false);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="border-b border-neutral-200 bg-surface">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{mobileOpen ? "Close admin menu" : "Open admin menu"}</span>
          </button>
          <Link href="/admin" className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
            <ShieldCheck className="size-5 text-primary-700" aria-hidden="true" />
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <AdminNotificationBell />
          <AdminAccountMenu />
        </div>
      </div>

      <div
        className={cn(
          "grid border-neutral-200 transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none lg:hidden",
          mobileOpen ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <nav id="admin-mobile-nav" aria-label="Admin" inert={!mobileOpen || undefined} className="p-3">
            <AdminNavLinks onNavigate={() => setMobileOpen(false)} />
          </nav>
        </div>
      </div>
    </header>
  );
}

export { AdminHeader };
