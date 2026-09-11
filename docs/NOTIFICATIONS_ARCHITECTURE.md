# Notifications & Application Communication Architecture

Introduced in Prompt 54. Prepares Little Learners Learning for a future
real notification system — a structured model, an abstracted delivery
layer, and a working (if backend-less) UI — not a finished messaging
platform. Read `docs/ADMISSIONS_ARCHITECTURE.md` and
`docs/AI_ASSISTANT_ARCHITECTURE.md` first: this reuses both the account
model the admissions system already established and the exact
provider-abstraction shape the AI assistant already proved out.

## No invented notifications

The brief is explicit: don't fabricate a notification, an application
update, or a delivery that didn't really happen. So every notification
this codebase can ever create today is created in direct response to a
real event a family or teacher actually caused — never a timer, a fake
"your application is under review" message, or a seeded example row.
Right now that means exactly two triggers exist
(`src/lib/admissions/use-applications.ts`): a family submitting an
application, and a family withdrawing one. Both call
`createNotification` (`src/lib/notifications/local-notifications.ts`)
with real content: the real reference number, a link to the real
application, and no promise about what happens next beyond what's true
today (no live review process exists — see
`docs/ADMISSIONS_ARCHITECTURE.md`).

## No duplicate user system

A `Notification` (`src/lib/notifications/types.ts`) belongs to
`recipientAccountId` — one of the same placeholder ids the rest of the app
already uses for "this browser's one parent/teacher"
(`local-browser-only` in `src/lib/accounts/local-children.ts`,
`local-browser-only-teacher` in `src/lib/accounts/local-teacher.ts`).
Nothing new was invented to identify who a notification is for; once real
accounts and sessions exist (`docs/ACCOUNTS_ARCHITECTURE.md`), this field
becomes a real foreign key to `accounts.id`, nothing else about the model
changes shape.

## The notification model

```ts
export const NOTIFICATION_TYPES = [
  "application-update", "account-activity", "learning-activity",
  "teacher-activity", "resource-update", "platform-message",
] as const;

export interface Notification {
  id: string;
  recipientAccountId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: { kind: "application" | "child-profile" | "teacher-profile" | "resource"; id: string };
  action?: { label: string; href: string };
  read: boolean;
  createdAt: string;
  deliveries: { channel: NotificationChannel; status: NotificationDeliveryStatus }[];
}
```

Every field the brief asked for is here: recipient, type, title, message,
a related entity (an opaque reference, never a copy of that record's own
data, so a notification can never go stale or duplicate information that
already lives on the real record), read/unread, created date, an optional
single action, and per-channel delivery status.

### Which types are real vs. prepared

Only `"application-update"` is ever actually created by any code path in
this repository today. The other five are real, documented categories —
not placeholders — that a future feature can start using the moment it has
a genuine event to report:

| Type | Who would create it | Reachable today? |
|---|---|---|
| `application-update` | A family submitting or withdrawing a real application | **Yes** |
| `account-activity` | A future real account event (sign-up confirmed, password changed) | No — no real account/session system exists yet |
| `learning-activity` | A future real progress milestone | No — `docs/PROGRESS_ARCHITECTURE.md`'s events don't create notifications yet |
| `teacher-activity` | A future real teacher-side event (resource reviewed, profile verified) | No — no reviewer/verification workflow exists yet |
| `resource-update` | A future real resource-review outcome | No — see `Resource.reviewStatus`, never set automatically |
| `platform-message` | A future real platform-wide announcement | No — nothing generates these yet |

This is the identical "prepared, never automatic" rule
`UNREACHABLE_APPLICATION_STATUSES` already follows in
`src/lib/admissions/types.ts`: the type system already accounts for all
six, so adding a real trigger for one later is additive, not a redesign.

## Channel architecture

`src/lib/notifications/channels.ts` defines `NotificationChannelProvider`
— the same provider-abstraction shape the AI assistant already uses
(`AiAssistantProvider`, `src/lib/ai/get-provider.ts`):

```ts
export interface NotificationChannelProvider {
  channel: NotificationChannel; // "in-app" | "email" | "whatsapp" | "sms" | "push"
  connected: boolean;
  deliver(notification): NotificationDelivery;
}
```

`getNotificationChannelProviders()` returns one provider per channel. Only
`in-app`'s `connected` is `true` — "delivering" in-app just means the
notification row exists in this browser's own local store, which needs no
external service. Every other channel's provider never makes a network
call; its `deliver()` returns `{ status: "not-connected" }` honestly,
exactly like `devPlaceholderProvider` (`src/lib/ai/dev-placeholder-provider.ts`)
never pretends to be a real AI. **Connecting a real channel later means
replacing one provider's `deliver` with a real implementation and flipping
its `connected` flag — nothing that calls `createNotification` changes.**

## Storage

`src/lib/notifications/local-notifications.ts` — same
`useSyncExternalStore`-backed localStorage pattern as every other
local-first store in this app (`local-applications.ts`,
`local-children.ts`). Storage key:
`little-learners-learning:notifications`. `createNotification` is the one
function every real trigger calls: it runs the requested channels through
`getNotificationChannelProviders()`, records each channel's real delivery
outcome, and commits the notification to this browser's list.

## UI

- **The header bell** (`src/components/patterns/notification-center.tsx`)
  — a `NotificationCenter` mounted once around `SiteHeader`
  (`src/components/layout/site-header.tsx`), the same position and the
  same reason `AiAssistant` wraps the whole layout: a Radix
  `Dialog.Trigger` binds to the *nearest* `Dialog.Root` ancestor regardless
  of which `Root` it came from (the bug documented in
  `docs/AI_PARENT_ASSISTANT_ARCHITECTURE.md`), so `NotificationCenterTrigger`
  is a plain React context, not a Radix `Trigger` — identical to
  `AiAssistantOpenContext`. One bell icon, with a small unread dot, sits
  next to Search and the AI assistant in both the desktop header and the
  mobile menu — nothing added to `primaryNav`/`footerNav`, so the main
  navigation itself is untouched.
- **The dialog** shows the most recent six notifications, an honest
  "in-app only" note, "Mark all as read," and a "View all" link — never a
  fabricated summary.
- **`/dashboard/notifications`** (`NotificationsDashboard`) — the full,
  unfiltered list, for when there's more than the bell's preview shows.
  Both the bell and this page render the same `NotificationRow`
  (`src/components/patterns/notification-row.tsx`) and read the same
  `useNotifications()` store, so marking one read anywhere updates the
  unread count everywhere immediately. Private, noindexed, same pattern as
  `/dashboard/applications`.
- **Empty state**: "No notifications yet" with an honest description of
  what will eventually appear there — never a sample notification.
- **Read/unread**: an unread row is bolded with a small filled dot;
  clicking a row (or its action link) marks it read.

## Privacy

- A child's name is never put in a notification's title or message — the
  two real triggers today reference only a reference number and a generic
  sentence, never a child's identity. `relatedEntity` stores only an
  opaque `id`, not a copy of the child/application's own data, so even a
  future notification about a child-linked event can be built without
  putting the child's name in a message body.
- There is no session system (`docs/ACCOUNTS_ARCHITECTURE.md`), so there is
  no second user's notifications that could ever reach this browser —
  ownership by construction, the identical reasoning already documented
  for `ChildProfile` and `Application`. Once real accounts and a server
  exist, the enforcement point becomes Row Level Security on a
  `notifications` table (a signed-in account reads only rows where
  `recipient_account_id` matches its own id, checked server-side) — the
  same migration path already described for every other local-first store
  in this app. No client-side `if (recipientAccountId !== currentUser.id)`
  check was added here, for the same reason none was added to the
  admissions tracking experience: it would imply a real multi-user
  boundary exists today, when none does.
- `/dashboard/notifications` and the bell dialog are both
  `robots: { index: false, follow: false }` / never indexed — belt and
  suspenders on top of an architecture that has nothing to leak.

## Testing

Verified live, in one browser tab: submitting a real application creates
an "Application submitted" notification with the real reference number;
withdrawing one creates "Application withdrawn"; both show up immediately
in the header bell (with an unread dot and count) and on
`/dashboard/notifications`; clicking a notification's action navigates to
the real application and marks it read everywhere; "Mark all as read"
clears every unread dot; the empty state renders correctly on a fresh
browser with no notifications yet. Confirmed the bell opens correctly from
both the header and the mobile menu without hijacking (or being hijacked
by) the Search or AI assistant dialogs. Confirmed
`/dashboard/notifications` stays noindex. Confirmed existing parent,
teacher, child, learning, resource, games, AI assistant, and admissions
journeys are all unaffected. Ran typecheck, lint, the full Vitest suite
(including new tests for `getUnreadCount`, `sortNotificationsByRecency`,
and every channel provider's honest connected/not-connected behavior),
and a production build; all clean.
