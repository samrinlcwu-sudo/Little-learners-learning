"use client";

import { BellOff } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { NotificationRow } from "@/components/patterns/notification-row";
import { useNotifications } from "@/lib/notifications/use-notifications";

/**
 * The full, real list of this browser's own notifications — never
 * paginated-away or trimmed the way the header bell's preview is. Reads
 * the same store as the bell (src/lib/notifications/use-notifications.ts),
 * so marking one read here updates the bell's unread count immediately and
 * vice versa. See docs/NOTIFICATIONS_ARCHITECTURE.md.
 */
function NotificationsDashboard() {
  const { notifications, ready, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
        eyebrow="Notifications"
        title="Your notifications"
        description="Real updates about things that actually happened in your account — nothing invented."
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-2xl">
          <Alert variant="info" className="mb-8">
            Only in-app notifications are active right now — email, WhatsApp, SMS, and push notifications aren&apos;t
            connected yet. Everything below stays on this device.
          </Alert>

          <Card className="p-2 sm:p-3">
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <Heading level="h3" as="h2">
                All notifications
              </Heading>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead}>
                  Mark all as read
                </Button>
              )}
            </div>

            {!ready ? null : notifications.length === 0 ? (
              <EmptyState
                className="m-2"
                icon={BellOff}
                title="No notifications yet"
                description="You'll see updates about your applications and account here as they happen."
              />
            ) : (
              <ul className="space-y-1 p-1">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <NotificationRow notification={notification} onOpen={(n) => markRead(n.id)} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { NotificationsDashboard };
