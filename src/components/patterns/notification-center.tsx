"use client";

import * as React from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/lib/notifications/use-notifications";
import { NotificationRow } from "@/components/patterns/notification-row";
import type { Notification } from "@/lib/notifications/types";

const PREVIEW_COUNT = 6;

/**
 * `NotificationCenter` sits above `SiteSearch` in the header's tree
 * (src/components/layout/site-header.tsx), same as `AiAssistant` does in
 * the root layout — and a Radix `Dialog.Trigger` binds to the *nearest*
 * `Dialog.Root` ancestor regardless of which `Root` it was imported from
 * (see the identical comment on `AiAssistantOpenContext`,
 * src/components/patterns/ai-assistant.tsx). This plain React context
 * avoids that bug the same way: it carries only "open the notification
 * center," independent of Radix's own Dialog context, so a
 * `NotificationCenterTrigger` anywhere in the tree opens this dialog and
 * nothing else's trigger is affected.
 */
const NotificationCenterOpenContext = React.createContext<(() => void) | null>(null);

export interface NotificationCenterProps {
  children: React.ReactNode;
}

/**
 * The one place the notification center is actually rendered — mounted
 * once around the header so both the desktop bell icon and the mobile menu
 * row open the same shared dialog. Reads this browser's own real
 * notifications only (src/lib/notifications/use-notifications.ts) — never
 * invents one. See docs/NOTIFICATIONS_ARCHITECTURE.md.
 */
function NotificationCenter({ children }: NotificationCenterProps) {
  const [open, setOpen] = React.useState(false);
  const { notifications, ready, unreadCount, markRead, markAllRead } = useNotifications();
  const openCenter = React.useCallback(() => setOpen(true), []);

  function handleOpenNotification(notification: Notification) {
    markRead(notification.id);
    setOpen(false);
  }

  const preview = notifications.slice(0, PREVIEW_COUNT);

  return (
    <NotificationCenterOpenContext.Provider value={openCenter}>
      {children}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
              <div>
                <DialogPrimitive.Title className="font-display text-base font-semibold text-ink">
                  Notifications
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-sm text-neutral-500">
                  In-app only for now — email, WhatsApp, SMS, and push aren&apos;t connected yet.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Close notifications</span>
              </DialogPrimitive.Close>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2" aria-live="polite">
              {!ready ? null : preview.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <BellOff className="size-8 text-neutral-300" aria-hidden="true" />
                  <p className="font-medium text-ink">No notifications yet</p>
                  <p className="text-sm text-neutral-500">
                    You&apos;ll see updates about your applications and account here as they happen.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {preview.map((notification) => (
                    <li key={notification.id}>
                      <NotificationRow notification={notification} onOpen={handleOpenNotification} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 px-5 py-3">
              {unreadCount > 0 ? (
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  Mark all as read
                </Button>
              ) : (
                <span />
              )}
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-primary-700 underline-offset-4 hover:underline"
              >
                View all
              </Link>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </NotificationCenterOpenContext.Provider>
  );
}

export interface NotificationCenterTriggerProps {
  asChild?: boolean;
  children: React.ReactElement<{ onClick?: (event: React.MouseEvent) => void }>;
}

/** Deliberately not `DialogPrimitive.Trigger` — see the comment on `NotificationCenterOpenContext` above. */
function NotificationCenterTrigger({ asChild, children }: NotificationCenterTriggerProps) {
  const openCenter = React.useContext(NotificationCenterOpenContext);

  function handleClick(event: React.MouseEvent) {
    children.props.onClick?.(event);
    openCenter?.();
  }

  if (asChild) {
    return React.cloneElement(children, { onClick: handleClick });
  }
  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

/**
 * A ready-made bell icon with an unread-count dot, for the header's icon
 * row. `hideLabel` (default) renders a sr-only accessible name for the
 * icon-only desktop button; pass `hideLabel={false}` where a visible label
 * already sits next to it (the mobile menu row), so screen readers aren't
 * given the same name twice.
 */
function NotificationBellIcon({ className, hideLabel = true }: { className?: string; hideLabel?: boolean }) {
  const { unreadCount } = useNotifications();
  return (
    <span className={className}>
      <Bell className="size-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-error-600" aria-hidden="true" />
      )}
      {hideLabel && (
        <span className="sr-only">Notifications{unreadCount > 0 ? ` (${unreadCount} unread)` : ""}</span>
      )}
    </span>
  );
}

export { NotificationCenter, NotificationCenterTrigger, NotificationBellIcon };
