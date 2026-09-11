import { getEventsForChild } from "@/lib/progress/local-progress";
import { summarizeChildProgress, type ChildProgressSummary } from "@/lib/progress/summarize";
import { getEarnedAchievements, type Achievement } from "@/lib/progress/achievements";
import { getNextStepSuggestion, type NextStepSuggestion } from "@/lib/learning-journey";
import type { ProgressEvent } from "@/lib/progress/types";

/**
 * One child's progress, and only that — the "Progress" node in the Prompt
 * 47 knowledge chain. This module is deliberately separate from
 * public-knowledge.ts: everything it returns is specific to one real
 * child's own recorded events and must never be merged into, or answered
 * from, the public knowledge functions. A caller decides whose events to
 * pass in; this file never reads localStorage itself, so it can't
 * accidentally reach across children the way `local-progress.ts` and
 * `local-children.ts` already prevent by construction (see
 * docs/AI_KNOWLEDGE_LAYER_ARCHITECTURE.md, "Parent/child separation").
 */
export interface ChildProgressKnowledge extends ChildProgressSummary {
  childId: string;
  /** Only ever earned badges — never a locked checklist, same rule as achievement-badges.tsx. */
  achievements: Achievement[];
  /** What this child could try next, or null when there's no honest signal yet — see getNextStepSuggestion. */
  nextStep: NextStepSuggestion | null;
}

/**
 * Composes three already-real, already-tested functions
 * (getEventsForChild, summarizeChildProgress, getEarnedAchievements,
 * getNextStepSuggestion) into the one shape a future assistant needs to
 * answer "how is my child doing" or "what can they practice next" — no new
 * progress logic, no invented score or percentage.
 */
export function getChildProgressKnowledge(childId: string, allEvents: ProgressEvent[]): ChildProgressKnowledge {
  const events = getEventsForChild(allEvents, childId);
  const summary = summarizeChildProgress(events);

  return {
    childId,
    ...summary,
    achievements: getEarnedAchievements(events),
    nextStep: getNextStepSuggestion(events),
  };
}
