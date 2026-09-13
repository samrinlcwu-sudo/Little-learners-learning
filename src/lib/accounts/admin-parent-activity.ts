import type { ProgressEvent } from "@/lib/progress/types";

export interface FamilyActivitySummary {
  totalEvents: number;
  lastActivityAt?: string;
}

/**
 * The one, deliberately coarse "relevant learning activity summary" the
 * brief asks for on a parent/family's admin view (Prompt 65) — a real
 * count and a real last-active date, both aggregated across every child
 * in the family, and nothing more specific than that. This is not the
 * same decision as `AdminChildDetail`'s: that page shows a single child's
 * own admin record and deliberately excludes progress entirely, because a
 * child's individual learning history isn't "relevant account
 * information" for a suspension decision
 * (docs/ADMIN_ARCHITECTURE.md, "Child privacy"). A family-level count is
 * different in kind — it answers "is this account actually in use," not
 * "what did this specific child do" — so it never lists which subject,
 * game, resource, or score was involved, only how many events and when
 * the most recent one was.
 */
export function getFamilyActivitySummary(events: ProgressEvent[], childIds: string[]): FamilyActivitySummary {
  const familyEvents = events.filter((event) => childIds.includes(event.childId));
  if (familyEvents.length === 0) {
    return { totalEvents: 0 };
  }
  const lastActivityAt = familyEvents.reduce(
    (latest, event) => (event.occurredAt > latest ? event.occurredAt : latest),
    familyEvents[0].occurredAt,
  );
  return { totalEvents: familyEvents.length, lastActivityAt };
}
