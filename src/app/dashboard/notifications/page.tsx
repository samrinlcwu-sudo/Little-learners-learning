import type { Metadata } from "next";
import { NotificationsDashboard } from "@/components/patterns/notifications-dashboard";

/**
 * A notification's real content lives only in this browser's localStorage
 * (src/lib/notifications/local-notifications.ts) — the server never sees
 * it, so this metadata can't leak it, the same reasoning as every other
 * dashboard route (docs/ADMISSIONS_ARCHITECTURE.md,
 * docs/ACCOUNTS_ARCHITECTURE.md).
 */
export const metadata: Metadata = {
  title: "Notifications",
  description: "Your Little Learners Learning notifications.",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return <NotificationsDashboard />;
}
