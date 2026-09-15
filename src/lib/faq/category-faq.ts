import type { LearningCategory } from "@/config/learning-categories";
import type { CategoryJourney } from "@/lib/learning-journey";
import type { FaqItem } from "@/lib/seo/faq-schema";
import { joinWithAnd } from "@/lib/utils/join-with-and";

/**
 * Every answer here is computed from fields `LearningCategory` and
 * `CategoryJourney` already carry — the same "derive, don't fabricate"
 * technique `subtopicMatchesTags`/`subtopicMatchesSkill` (Prompt 75) and
 * `buildParentRows` (Prompt 65) use elsewhere. Nothing here is a
 * hand-written per-category answer: the same three questions are asked of
 * every category, and the answer text is assembled from that category's own
 * real `description`, `ageRange`, `learningObjectives`, and its actual
 * published content counts. A category with zero published items still
 * gets an honest "still being added" answer, not a skipped question — the
 * same voice `EmptyState` already uses elsewhere on this same page.
 *
 * `articleCount` is passed in rather than read from `CategoryJourney`
 * because published blog articles aren't part of that type — the category
 * page computes its own `categoryArticles` list already
 * (src/app/learn/[category]/page.tsx), so this just takes the count.
 */
export function buildCategoryFaq(
  category: LearningCategory,
  journey: Pick<CategoryJourney, "resources" | "games"> | null,
  articleCount: number,
): FaqItem[] {
  const objectives = category.learningObjectives;
  const objectiveSentence =
    objectives.length > 1
      ? `It focuses on ${objectives.slice(0, -1).join(", ").toLowerCase()} and ${objectives[objectives.length - 1].toLowerCase()}.`
      : objectives.length === 1
        ? `It focuses on ${objectives[0].toLowerCase()}.`
        : "";

  const items: FaqItem[] = [
    {
      question: `What does ${category.name} cover?`,
      answer: `${category.description} ${objectiveSentence}`.trim(),
    },
    {
      question: `What age is ${category.name} for?`,
      answer: `${category.name} is aimed at ages ${category.ageRange.minYears}–${category.ageRange.maxYears} on Little Learners Learning.`,
    },
  ];

  const resourceCount = journey?.resources.length ?? 0;
  const gameCount = journey?.games.length ?? 0;
  const totalCount = resourceCount + gameCount + articleCount;

  if (totalCount > 0) {
    const parts: string[] = [];
    if (resourceCount > 0) parts.push(`${resourceCount} resource${resourceCount === 1 ? "" : "s"}`);
    if (gameCount > 0) parts.push(`${gameCount} game${gameCount === 1 ? "" : "s"}`);
    if (articleCount > 0) parts.push(`${articleCount} article${articleCount === 1 ? "" : "s"}`);

    items.push({
      question: `What resources, games, or activities are available for ${category.name} today?`,
      answer: `Today there ${totalCount === 1 ? "is" : "are"} ${joinWithAnd(parts)} for ${category.name}. More is added as the library grows.`,
    });
  } else {
    items.push({
      question: `Is there content available for ${category.name} yet?`,
      answer: `Not yet — ${category.name} is a defined subject on the platform, but no resource, game, or article for it has been published today. Check back as the library grows.`,
    });
  }

  return items;
}
