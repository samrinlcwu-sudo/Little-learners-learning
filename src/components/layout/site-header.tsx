"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { primaryNav, type NavLink } from "@/config/nav";
import { Button } from "@/components/ui/button";
import { SiteSearch, SiteSearchTrigger } from "@/components/patterns/site-search";
import { AiAssistantTrigger } from "@/components/patterns/ai-assistant";
import { NotificationCenter, NotificationCenterTrigger, NotificationBellIcon } from "@/components/patterns/notification-center";
import { useAiAudience } from "@/lib/ai/use-ai-audience";
import { AI_AUDIENCE_PERMISSIONS } from "@/lib/ai/permissions";
import { cn } from "@/lib/utils/cn";

export interface SiteHeaderProps {
  links?: NavLink[];
}

/**
 * Search opens the real site search dialog. Sign in/Create account link to
 * real pages — the forms and their validation are fully real, even though
 * no account is actually created yet (see src/lib/supabase/is-configured.ts).
 * There's no session system yet, so every visitor is signed out; this is
 * the one state to show until real auth sessions exist.
 */
function HeaderActions({ className, assistantAvailable }: { className?: string; assistantAvailable: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <SiteSearchTrigger asChild>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
        >
          <Search className="size-5" aria-hidden="true" />
          <span className="sr-only">Search</span>
        </button>
      </SiteSearchTrigger>
      {assistantAvailable && (
        <AiAssistantTrigger asChild>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
          >
            <Sparkles className="size-5" aria-hidden="true" />
            <span className="sr-only">Ask the Little Learners Assistant</span>
          </button>
        </AiAssistantTrigger>
      )}
      <NotificationCenterTrigger asChild>
        <button
          type="button"
          className="relative inline-flex size-11 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
        >
          <NotificationBellIcon className="relative inline-flex" />
        </button>
      </NotificationCenterTrigger>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button variant="primary" size="sm" asChild>
        <Link href="/sign-up">Create account</Link>
      </Button>
    </div>
  );
}

function SiteHeader({ links = primaryNav }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const audience = useAiAudience();
  const assistantAvailable = AI_AUDIENCE_PERMISSIONS[audience].mayAccessAssistant;

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
    const query = window.matchMedia("(min-width: 1024px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) setMobileOpen(false);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <NotificationCenter>
      <SiteSearch>
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

          <nav aria-label="Primary" className="hidden lg:block">
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

          <HeaderActions className="hidden lg:flex" assistantAvailable={assistantAvailable} />

          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 lg:hidden"
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
            "grid border-neutral-200 transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none lg:hidden",
            mobileOpen ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <nav id="mobile-nav" aria-label="Primary" inert={!mobileOpen || undefined}>
              <div className="px-4 pt-3">
                <SiteSearchTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-11 w-full items-center gap-2.5 rounded-md border border-neutral-200 bg-neutral-100 px-3.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-200"
                  >
                    <Search className="size-4 shrink-0" aria-hidden="true" />
                    Search
                  </button>
                </SiteSearchTrigger>
              </div>
              {assistantAvailable && (
                <div className="px-4 pt-2">
                  <AiAssistantTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-11 w-full items-center gap-2.5 rounded-md border border-neutral-200 bg-neutral-100 px-3.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-200"
                    >
                      <Sparkles className="size-4 shrink-0" aria-hidden="true" />
                      Ask the assistant
                    </button>
                  </AiAssistantTrigger>
                </div>
              )}
              <div className="px-4 pt-2">
                <NotificationCenterTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="relative flex h-11 w-full items-center gap-2.5 rounded-md border border-neutral-200 bg-neutral-100 px-3.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-200"
                  >
                    <NotificationBellIcon className="relative inline-flex" hideLabel={false} />
                    <span>Notifications</span>
                  </button>
                </NotificationCenterTrigger>
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
                <Button variant="outline" asChild className="w-full" onClick={() => setMobileOpen(false)}>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button variant="primary" asChild className="w-full" onClick={() => setMobileOpen(false)}>
                  <Link href="/sign-up">Create account</Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </SiteSearch>
    </NotificationCenter>
  );
}

export { SiteHeader };
