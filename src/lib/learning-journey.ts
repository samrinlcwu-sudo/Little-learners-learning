import {
  getLearningCategoryBySlug,
  getRelatedCategories,
  type LearningCategory,
} from "@/config/learning-categories";
import { SAMPLE_CONTENT } from "@/lib/content/sample-content";
import { isPubliclyVisible, type LearningContent } from "@/lib/content/types";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished, type Game } from "@/lib/games/types";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { isResourcePublished, type Resource } from "@/lib/resources/types";
import type { ProgressEvent } from "@/lib/progress/types";

/**
 * Groups one category's real, already-published content into the shape a
 * learner actually moves through: see what the subject covers (Learn),
 * practice it (worksheets/activities), then play (games). This is a
 * presentation layer over data that already exists on the category page
 * (src/app/learn/[category]/page.tsx) — it doesn't add new content types
 * or a new content pipeline, just names the existing three groups as
 * steps so the page can show them as a journey instead of three unrelated
 * sections. A step is "available" only when a real published item exists;
 * an empty step is never hidden or faked as available.
 */
export interface JourneyStep {
  key: "learn" | "practice" | "play";
  label: string;
  description: string;
  anchor: string;
  available: boolean;
  count: number;
}

export interface CategoryJourney {
  category: LearningCategory;
  content: LearningContent[];
  resources: Resource[];
  games: Game[];
  steps: JourneyStep[];
}

export function getCategoryJourney(slug: string): CategoryJourney | null {
  const category = getLearningCategoryBySlug(slug);
  if (!category) return null;

  const content = SAMPLE_CONTENT.filter((item) => item.category === slug && isPubliclyVisible(item));
  const resources = SAMPLE_RESOURCES.filter((item) => item.category === slug && isResourcePublished(item));
  const games = SAMPLE_GAMES.filter((item) => item.category === slug && isGamePublished(item));

  const steps: JourneyStep[] = [
    {
      key: "learn",
      label: "Learn",
      description: "See what this subject covers.",
      anchor: "#content",
      available: content.length > 0,
      count: content.length,
    },
    {
      key: "practice",
      label: "Practice",
      description: "Worksheets and activities to try.",
      anchor: "#resources",
      available: resources.length > 0,
      count: resources.length,
    },
    {
      key: "play",
      label: "Play",
      description: "A game built around this subject.",
      anchor: "#games",
      available: games.length > 0,
      count: games.length,
    },
  ];

  return { category, content, resources, games, steps };
}

export interface NextStepSuggestion {
  /** Short line explaining why this was suggested, e.g. "Continue in Mathematics". */
  label: string;
  activityLabel: string;
  href: string;
  categoryName: string;
  kind: "game" | "resource" | "category";
}

/**
 * The one "what to explore next" shown anywhere on the platform — built
 * only from a child's own recorded events (src/lib/progress) plus what's
 * actually published in that same subject. There is no scoring, no AI, and
 * no guessing: if this child has no recorded activity yet, or has already
 * seen everything published in every subject they've touched, this
 * returns null and callers show their own honest "nothing yet" copy
 * instead of a fabricated suggestion. See docs/PROGRESS_ARCHITECTURE.md
 * for why estimated signals are deliberately avoided everywhere else in
 * this system — this function follows the same rule.
 */
export function getNextStepSuggestion(events: ProgressEvent[]): NextStepSuggestion | null {
  if (events.length === 0) return null;

  const visitedHrefs = new Set(events.map((event) => event.activityHref));
  const exploredTopics = new Set(events.map((event) => event.topic).filter((topic): topic is string => Boolean(topic)));

  const sortedByRecency = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const lastTopic = sortedByRecency.find((event) => event.topic)?.topic;
  if (!lastTopic) return null;

  const suggestion = findUnexploredInCategory(lastTopic, visitedHrefs);
  if (suggestion) return suggestion;

  // Everything published in the last-explored subject has already been
  // seen — point to a real related subject this child hasn't touched yet,
  // rather than repeating a suggestion or inventing one.
  const nextCategory = getRelatedCategories(lastTopic).find((category) => !exploredTopics.has(category.slug));
  if (!nextCategory) return null;

  return {
    kind: "category",
    label: "Explore a related subject",
    activityLabel: nextCategory.name,
    href: `/learn/${nextCategory.slug}`,
    categoryName: nextCategory.name,
  };
}

function findUnexploredInCategory(slug: string, visitedHrefs: Set<string>): NextStepSuggestion | null {
  const category = getLearningCategoryBySlug(slug);
  if (!category) return null;

  const game = SAMPLE_GAMES.find(
    (item) => item.category === slug && isGamePublished(item) && !visitedHrefs.has(`/games/${item.slug}`),
  );
  if (game) {
    return {
      kind: "game",
      label: `Continue in ${category.name}`,
      activityLabel: game.title,
      href: `/games/${game.slug}`,
      categoryName: category.name,
    };
  }

  const resource = SAMPLE_RESOURCES.find(
    (item) => item.category === slug && isResourcePublished(item) && !visitedHrefs.has(`/resources/${item.slug}`),
  );
  if (resource) {
    return {
      kind: "resource",
      label: `Continue in ${category.name}`,
      activityLabel: resource.title,
      href: `/resources/${resource.slug}`,
      categoryName: category.name,
    };
  }

  return null;
}
