"use client";

import Link from "next/link";
import { Bell, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAdminAuditLog } from "@/lib/admin/audit-log";
import { cn } from "@/lib/utils/cn";

const PREVIEW_COUNT = 5;

/**
 * The "notification area" the brief asks for — built on the same real
 * activity trail `AdminAuditPanel` already shows on `/admin`
 * (`useAdminAuditLog()`, docs/ADMIN_ARCHITECTURE.md "Auditability"), not
 * a second, disconnected notification system. There's no "read/unread"
 * state anywhere in this codebase to attach to these events, so the badge
 * shows a plain real count, never an invented "unread" number.
 */
function AdminNotificationBell() {
  const { events, ready } = useAdminAuditLog();
  const preview = events.slice(0, PREVIEW_COUNT);
  const count = ready ? events.length : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex size-11 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
        >
          <Bell className="size-5" aria-hidden="true" />
          {count > 0 && (
            <span
              className={cn(
                "absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-600 px-1 text-[10px] font-semibold text-white",
              )}
            >
              {count > 9 ? "9+" : count}
            </span>
          )}
          <span className="sr-only">Recent admin activity{count > 0 ? ` (${count})` : ""}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Recent activity</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!ready || preview.length === 0 ? (
          <p className="px-2.5 py-4 text-center text-sm text-neutral-500">
            {ready ? "No activity yet." : "Loading…"}
          </p>
        ) : (
          <ul className="max-h-80 space-y-0.5 overflow-y-auto">
            {preview.map((event) => (
              <li key={event.id} className="rounded-sm px-2.5 py-2 text-sm hover:bg-neutral-100">
                <p className="text-ink">{event.details}</p>
                <time dateTime={event.occurredAt} className="text-xs text-neutral-500">
                  {new Date(event.occurredAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin">
            <History className="mr-2 size-4" aria-hidden="true" />
            View all activity
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { AdminNotificationBell };
