"use client";

import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { EmptyState } from "@/components/ui/empty-state";
import { useAdminAuditLog } from "@/lib/admin/audit-log";

const PREVIEW_COUNT = 8;

/**
 * A real, honest activity trail — see docs/ADMIN_ARCHITECTURE.md,
 * "Auditability." Every entry is something that genuinely happened in
 * this browser; there is no seeded example row and no way for this list
 * to show more than `getAdminAuditLogSnapshot()` actually contains.
 */
function AdminAuditPanel() {
  const { events, ready } = useAdminAuditLog();
  const preview = events.slice(0, PREVIEW_COUNT);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <History className="size-5 text-neutral-500" aria-hidden="true" />
        <Heading level="h3" as="h2">
          Recent activity
        </Heading>
      </div>
      <p className="mt-1 text-sm text-neutral-600">
        A real, local record of administrative actions on this device — see docs/ADMIN_ARCHITECTURE.md.
      </p>

      {!ready ? null : preview.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={History}
          title="No activity yet"
          description="Real admin actions — sign-ins, moderation decisions, account status changes — appear here as they happen."
        />
      ) : (
        <ul className="mt-4 space-y-3">
          {preview.map((event) => (
            <li key={event.id} className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 text-sm last:border-0 last:pb-0">
              <span className="text-neutral-700">{event.details}</span>
              <time dateTime={event.occurredAt} className="shrink-0 text-xs text-neutral-500">
                {new Date(event.occurredAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export { AdminAuditPanel };
