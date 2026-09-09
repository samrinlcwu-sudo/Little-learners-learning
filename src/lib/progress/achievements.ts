import type { ProgressEvent, ProgressEventType } from "./types";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  /** The real event that satisfied this achievement — set only when `earned` is true. */
  earnedAt?: string;
}

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  check: (events: ProgressEvent[]) => ProgressEvent | undefined;
}

function sortedByTime(events: ProgressEvent[]): ProgressEvent[] {
  return [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

/** The first event (in time) for each distinct key — used so a badge is earned the moment it becomes true, not re-earned on every later match. */
function distinctByKey(events: ProgressEvent[], key: (event: ProgressEvent) => string | undefined): ProgressEvent[] {
  const seen = new Set<string>();
  const result: ProgressEvent[] = [];
  for (const event of sortedByTime(events)) {
    const value = key(event);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(event);
  }
  return result;
}

/**
 * The Nth distinct real activity of a given type — "distinct" meaning by
 * `activityHref`, not a raw event count. Completing the same game five
 * times is one real accomplishment worth noting once, not five; counting
 * raw events here would let replaying a single easy game "earn" a
 * multi-activity badge, which is exactly the kind of inflated, not-really-
 * earned progress this system exists to avoid.
 */
function nthDistinctActivity(events: ProgressEvent[], type: ProgressEventType, n: number): ProgressEvent | undefined {
  return distinctByKey(
    events.filter((event) => event.type === type),
    (event) => event.activityHref,
  )[n - 1];
}

function nthDistinctTopic(events: ProgressEvent[], n: number): ProgressEvent | undefined {
  return distinctByKey(events, (event) => event.topic)[n - 1];
}

const DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Started exploring Little Learners Learning.",
    check: (events) => sortedByTime(events)[0],
  },
  {
    id: "game-explorer",
    title: "Game Explorer",
    description: "Completed a game.",
    check: (events) => nthDistinctActivity(events, "game_completed", 1),
  },
  {
    id: "game-champion",
    title: "Game Champion",
    description: "Completed 3 different games.",
    check: (events) => nthDistinctActivity(events, "game_completed", 3),
  },
  {
    id: "resource-reader",
    title: "Resource Reader",
    description: "Opened a worksheet, ebook, or activity.",
    check: (events) => nthDistinctActivity(events, "resource_viewed", 1),
  },
  {
    id: "subject-explorer",
    title: "Subject Explorer",
    description: "Explored 2 different subjects.",
    check: (events) => nthDistinctTopic(events, 2),
  },
  {
    id: "curious-mind",
    title: "Curious Mind",
    description: "Explored 4 different subjects.",
    check: (events) => nthDistinctTopic(events, 4),
  },
];

/**
 * Every badge is computed fresh from a child's own real events every time
 * this is called — there is no separate "earned" record anywhere, so a
 * badge can never drift out of sync with what actually happened, and
 * nothing here can be earned without the real event(s) that justify it.
 * See docs/PROGRESS_ARCHITECTURE.md's "only record what can actually be
 * observed" rule — this only ever reads that record, never adds to it.
 */
export function getAchievements(events: ProgressEvent[]): Achievement[] {
  return DEFINITIONS.map((definition) => {
    const match = definition.check(events);
    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      earned: Boolean(match),
      earnedAt: match?.occurredAt,
    };
  });
}

/** Just the earned ones, oldest-first — the only slice either UI surface renders (see docs/PROGRESS_ARCHITECTURE.md: never a checklist of what's missing). */
export function getEarnedAchievements(events: ProgressEvent[]): Achievement[] {
  return getAchievements(events).filter((achievement) => achievement.earned);
}
