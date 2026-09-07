import { getLearningCategoryBySlug } from "@/config/learning-categories";
import type { ProgressEvent } from "./types";

export interface ChildProgressSummary {
  /** Distinct subject names this child's events touched, most recent first. */
  topicsExplored: string[];
  /** The last few events, most recent first — enough for "what did they just do," not a full history. */
  recentActivities: ProgressEvent[];
  lastActiveAt?: string;
}

/**
 * Turns a raw event list into the handful of facts a parent actually wants
 * — never a computed score, percentage, or streak, since none of those
 * would mean anything beyond what's already in the events themselves.
 */
export function summarizeChildProgress(events: ProgressEvent[], recentCount = 5): ChildProgressSummary {
  const sorted = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const topicsExplored: string[] = [];
  const seenTopics = new Set<string>();
  for (const event of sorted) {
    if (!event.topic || seenTopics.has(event.topic)) continue;
    const category = getLearningCategoryBySlug(event.topic);
    if (!category) continue;
    seenTopics.add(event.topic);
    topicsExplored.push(category.name);
  }

  return {
    topicsExplored,
    recentActivities: sorted.slice(0, recentCount),
    lastActiveAt: sorted[0]?.occurredAt,
  };
}

/** A short, plain-language line for one event — the only place event.type gets turned into words a parent reads. */
export function describeEvent(event: ProgressEvent): string {
  switch (event.type) {
    case "topic_explored":
      return `Explored ${event.activityLabel}`;
    case "resource_viewed":
      return `Opened ${event.activityLabel}`;
    case "game_played":
      return `Played ${event.activityLabel}`;
    case "game_completed":
      return event.score
        ? `Completed ${event.activityLabel} — ${event.score.correct}/${event.score.total}`
        : `Completed ${event.activityLabel}`;
  }
}
