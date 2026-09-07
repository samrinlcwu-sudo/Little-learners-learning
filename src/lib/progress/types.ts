/**
 * The progress event model — contracts only, same pattern as
 * src/lib/accounts/types.ts. See docs/PROGRESS_ARCHITECTURE.md for the
 * full rationale, including exactly why "worksheet completed" and
 * "activity completed" are deliberately NOT in this list.
 *
 * Only four things are ever recorded, because only four things can
 * actually be observed by the system today:
 * - "topic_explored": a learning category page was opened.
 * - "resource_viewed": a resource detail page was opened. Not
 *   "resource_completed" — a downloaded worksheet gives no signal back to
 *   the site about whether it was ever done, so completion for it can't be
 *   recorded honestly.
 * - "game_played": a game was opened and started.
 * - "game_completed": a game's own engine reached its real completion
 *   state, with the real score it computed — never a guess.
 */
export type ProgressEventType = "topic_explored" | "resource_viewed" | "game_played" | "game_completed";

export interface ProgressEvent {
  id: string;
  childId: string;
  type: ProgressEventType;
  /** A learning-category slug (src/config/learning-categories.ts), when the activity belongs to one — most games and resources do. */
  topic?: string;
  /** Human-readable label for what was engaged with, e.g. "Letter Match" or "Mathematics". */
  activityLabel: string;
  /** The real route this activity lives at, so a parent can revisit it. */
  activityHref: string;
  /** Only set for "game_completed" — the real numbers the game engine computed, never invented or estimated. */
  score?: { correct: number; total: number };
  occurredAt: string;
}
