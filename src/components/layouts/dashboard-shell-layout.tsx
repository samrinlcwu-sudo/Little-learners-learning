import * as React from "react";
import type { NavLink } from "@/config/nav";
import { cn } from "@/lib/utils/cn";

export interface DashboardShellLayoutProps {
  title: string;
  navItems: NavLink[];
  /** Which item to visually mark active — pass the current pathname. */
  activeHref?: string;
  children: React.ReactNode;
}

/**
 * Shared app-shell shape for every future authenticated area (parent
 * dashboard, teacher area, admin area) — one component, parametrized by
 * `navItems`, rather than three near-identical layouts. Not wired to any
 * route yet: no auth exists, so nothing should render this behind a real
 * URL until it does. See it previewed at /style-guide.
 */
function DashboardShellLayout({ title, navItems, activeHref, children }: DashboardShellLayoutProps) {
  return (
    <div className="flex min-h-[32rem] flex-col border border-neutral-200 md:flex-row">
      <aside className="border-b border-neutral-200 bg-surface-sunken p-4 md:w-56 md:border-b-0 md:border-r">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {title}
        </p>
        <nav aria-label={title} className="mt-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  aria-current={item.href === activeHref ? "page" : undefined}
                  className={cn(
                    "block rounded-md px-2.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-ink",
                    item.href === activeHref && "bg-primary-100 text-primary-800",
                  )}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}

export { DashboardShellLayout };
