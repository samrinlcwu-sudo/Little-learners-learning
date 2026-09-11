import Link from "next/link";
import { Circle } from "lucide-react";
import { NOTIFICATION_TYPE_LABELS, type Notification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils/cn";

export interface NotificationRowProps {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}

/**
 * One notification, shared by the header bell's compact list and the full
 * /dashboard/notifications page (src/components/patterns/notifications-dashboard.tsx)
 * so both stay visually identical. Real fields only — title/message as
 * written when the notification was created (src/lib/notifications/local-notifications.ts),
 * never re-derived or guessed here.
 */
function NotificationRow({ notification, onOpen }: NotificationRowProps) {
  const content = (
    <div
      className={cn(
        "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-neutral-100",
        !notification.read && "bg-primary-50/60",
      )}
    >
      <span className="mt-1.5 flex size-2 shrink-0 items-center justify-center">
        {!notification.read && <Circle className="size-2 fill-primary-600 text-primary-600" aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className={cn("text-sm", notification.read ? "font-medium text-neutral-700" : "font-semibold text-ink")}>
            {notification.title}
          </p>
          <time dateTime={notification.createdAt} className="shrink-0 text-xs text-neutral-500">
            {new Date(notification.createdAt).toLocaleString()}
          </time>
        </div>
        <p className="mt-0.5 text-sm text-neutral-600">{notification.message}</p>
        <p className="mt-1 text-xs text-neutral-400">{NOTIFICATION_TYPE_LABELS[notification.type]}</p>
      </div>
    </div>
  );

  if (notification.action) {
    return (
      <Link href={notification.action.href} onClick={() => onOpen(notification)} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className="block w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
    >
      {content}
    </button>
  );
}

export { NotificationRow };
