# Learning Progress Architecture

Introduced in Prompt 23, building directly on Prompt 22's child profiles.
Prompt 15 (see docs/GAMES_HUB_ARCHITECTURE.md) deliberately stopped at an
unconnected contract because no child profile existed to record events
against. That's no longer true, so this system is real: events are
genuinely recorded, in this browser's `localStorage`, the moment they
actually happen — never estimated, batched, or backfilled.

## The one rule everything else follows

**Only record what the system can actually observe.** Never a guess,
never an average, never "probably finished." This shaped which events
exist at all (see below) and is why there's no "worksheet completed" or
"activity completed" event: a downloaded worksheet or a printed activity
sheet gives the site no signal back about whether a child ever did it.
Claiming otherwise would be exactly the invented progress the brief
explicitly forbids. If a resource type is ever built with a genuine
in-browser completion signal (an interactive activity with a "done"
button that means something, say), a `resource_completed` event can be
added then — not before.

## Trackable events

`src/lib/progress/types.ts` defines `ProgressEventType`:

| Event | Fires when | Where |
|---|---|---|
| `topic_explored` | A subject page opens | `src/app/learn/[category]/page.tsx` |
| `resource_viewed` | A resource detail page opens | `src/app/resources/[resource]/page.tsx` |
| `game_played` | A game mounts and starts | `src/components/games/game-player.tsx` |
| `game_completed` | A game's own engine reaches its real completion state | each game's `onComplete` callback, e.g. `letter-match-game.tsx` |

`topic_explored`/`resource_viewed` are recorded by a tiny, invisible
Client Component (`src/components/patterns/track-page-view.tsx`) dropped
into an otherwise-Server-Component page — it renders nothing, it just
calls `recordProgressEvent` once on mount. `game_played` fires once from
`GamePlayer` when a game loads; `game_completed` fires from inside each
game's own `useChoiceGame`/`useMemoryGame` hook usage, with the exact
score that hook already computed — nothing recomputed or approximated at
the recording site.

No personal information is collected beyond what's needed to show "what
did this child do": which child, what type of event, which subject (when
relevant), a human-readable label, the real route, and a timestamp. No
IP address, no device info, no page-by-page click tracking beyond these
four meaningful moments.

## Data model

```ts
interface ProgressEvent {
  id: string;
  childId: string;
  type: ProgressEventType;
  topic?: string;          // a learning-category slug, when relevant
  activityLabel: string;   // "Letter Match", "Mathematics", ...
  activityHref: string;    // the real route, so a parent can revisit it
  score?: { correct: number; total: number }; // only ever set by game_completed, from the real engine result
  occurredAt: string;
}
```

This directly implements the brief's hierarchy — Child → Learning Area →
Topic → Activity → Completion → Date/time — without over-modeling it:
`childId` is the child, `topic` is both the learning area and the topic
(a category's parent group is derivable from its slug via
`learningCategoryGroups` whenever it's needed, rather than stored
redundantly), `activityLabel`/`activityHref` is the activity, `type`
encodes completion (`game_completed` vs. everything else) instead of a
separate boolean that could contradict it, and `occurredAt` is the
date/time. One flat, append-only event log — no separate "summary" table
to keep in sync, because `src/lib/progress/summarize.ts` computes
everything a view needs (topics explored, recent activity, last-active
time) from the raw events on read.

Migrating to real accounts later means writing these same rows into a
`progress_events` table (RLS: a parent reads only their own children's
rows) — the shape doesn't change.

## Storage: a tiny external store, same pattern as child profiles

`src/lib/progress/local-progress.ts` mirrors
`src/lib/accounts/local-children.ts` exactly: a module-level cache, a
`Set` of listeners, `localStorage` as the source of truth, read via
`useSyncExternalStore` (`src/lib/progress/use-progress-events.ts`) so the
server and the client's first paint agree on an empty list. Capped at 300
events (oldest dropped first) so a long browsing history can't grow this
without bound.

### Which child gets credit: the active-child pointer

There's no per-visitor login, so something has to decide which child a
game session or a page view belongs to. `setActiveChild`/`getActiveChildId`
in the same file implement the simplest honest answer: **whichever child's
own view was opened most recently**. `ChildExperience`
(`src/components/patterns/child-experience.tsx`) calls `setActiveChild`
the moment it renders a real child; `recordProgressEvent` reads that
pointer and, if none is set, **records nothing** — it never guesses or
falls back to "the first child" or "the only child."

This is a real limitation, stated plainly rather than hidden: in a
household with more than one child, playing without first reopening the
right child's view from the dashboard attributes activity to whoever was
last active, not necessarily whoever is actually at the keyboard. A
proper fix needs an actual "who's playing right now" concept, which needs
real sessions — tracked as a known gap, not solved with a guess today.

## Parent view

The dashboard's existing "Learning progress" section (Prompt 22 shipped
it as a permanent empty state) now renders, per child: subjects touched
(as plain badges, not a chart), and the last few things they did in plain
language ("Explored Mathematics," "Completed Letter Match — 3/3"), each
with a relative timestamp. No percentages, no comparison between
children, no trend lines — exactly the "what did they explore, which
areas, what did they recently finish" the brief asks for, nothing more.

## Child view

`ChildExperience`'s "Your learning journey" section lists the child's own
last few completed games with a small star row — the same
`getAccuracyReward` calculation already used on each game's own
completion screen (`src/lib/games/rewards.ts`), so a star shown here was
already earned, not computed differently for a different audience. No
percentage, no leaderboard, no "you're behind" framing — completion
itself is worth noting, nothing is compared to another child or to a
target.

## Privacy, SEO, AEO

Same architecture-level guarantee as child profiles
(docs/ACCOUNTS_ARCHITECTURE.md): a progress event never leaves the
browser it was recorded in — no API call, no database row — so "keep
child progress private" and "don't expose it publicly" are true by
construction. No new routes were added for this prompt; progress lives
inside the existing `/dashboard` and `/dashboard/children/[childId]`,
which already set `robots: { index: false, follow: false }`. Every public
educational page (`/learn`, `/resources`, `/games` and their detail
pages) is completely unaffected — `TrackPageView` renders nothing and
changes no visible content, metadata, or crawlability. No FAQ or
structured-data content was added anywhere in this system, on either the
private dashboard or the public pages.

## Future scalability (documented, not built)

The event log is intentionally the kind of data future features would
read, not a shape they'd force a rewrite of:

- **Learning recommendations** ("try Shapes next") would read
  `topicsExplored` and suggest categories not yet in that list.
- **Parent insights** would aggregate across a longer time window than
  "recent activity" already does.
- **Teacher insights** would need a classroom/roster concept that doesn't
  exist yet — `ClassroomProgressSummary` from the old, now-removed
  `src/lib/games/progress.ts` sketched this; it can return once teacher
  accounts are real.
- **AI learning assistance / personalized learning** would consume this
  same event stream as context.

None of these are implemented. Building them now, without real accounts
or a real recommendation model behind them, would mean inventing the
exact kind of output — a suggestion, an insight, a personalization — that
this whole system exists to avoid faking.
