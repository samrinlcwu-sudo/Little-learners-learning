"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/config/admin-nav";
import { cn } from "@/lib/utils/cn";

export interface AdminNavLinksProps {
  /** Called after a link is clicked — used by the mobile panel to close itself. */
  onNavigate?: () => void;
  className?: string;
}

/** `/admin` only matches exactly (it would otherwise prefix-match every other admin route); every other entry also matches its own nested routes (e.g. `/admin/teachers/[teacherId]`). */
function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The real admin nav, rendered identically by the desktop sidebar and the mobile collapsible panel — one list, two layouts. */
function AdminNavLinks({ onNavigate, className }: AdminNavLinksProps) {
  const pathname = usePathname() ?? "";

  return (
    <ul className={cn("space-y-1", className)}>
      {adminNav.map((item) => {
        const active = isAdminNavActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-ink",
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { AdminNavLinks, isAdminNavActive };
