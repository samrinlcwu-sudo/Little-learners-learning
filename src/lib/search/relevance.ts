/**
 * A transparent, rule-based relevance score — never randomness, never a
 * "sponsored" or popularity boost, nothing that would "manipulate results
 * artificially" (Prompt 72's own instruction). Every weight is a fixed,
 * documented constant applied the same way to every item, so the same
 * query always produces the same ranking for the same reason.
 *
 * The tiers directly implement the brief's stated priority order:
 * 1. title relevance (exact > starts-with > contains)
 * 2. category relevance
 * 3. educational topic/subject relevance
 * 4. age-group relevance (only scored when the searcher gave a target age)
 * 5. description relevance
 *
 * A score of 0 means "no match at all" — callers should exclude it, never
 * show a zero-relevance item just to pad a result count.
 */
export interface SearchableItem {
  title: string;
  /** A resolved, human-readable category/subject name — e.g. "Mathematics", not a slug. */
  categoryName?: string;
  /** A secondary topic/subject label distinct from the main category — e.g. a blog topic name, or a game's `skill`. */
  topic?: string;
  description: string;
  ageRange?: { minYears: number; maxYears: number };
}

const WEIGHT = {
  titleExact: 1000,
  titleStartsWith: 500,
  titleContains: 250,
  category: 100,
  topic: 50,
  age: 20,
  description: 10,
} as const;

export function scoreSearchMatch(query: string, item: SearchableItem, targetAge?: number): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  let score = 0;
  const title = item.title.trim().toLowerCase();

  if (title === q) {
    score += WEIGHT.titleExact;
  } else if (title.startsWith(q)) {
    score += WEIGHT.titleStartsWith;
  } else if (title.includes(q)) {
    score += WEIGHT.titleContains;
  }

  if (item.categoryName && item.categoryName.toLowerCase().includes(q)) {
    score += WEIGHT.category;
  }

  if (item.topic && item.topic.toLowerCase().includes(q)) {
    score += WEIGHT.topic;
  }

  if (
    targetAge != null &&
    item.ageRange &&
    targetAge >= item.ageRange.minYears &&
    targetAge <= item.ageRange.maxYears
  ) {
    score += WEIGHT.age;
  }

  if (item.description.toLowerCase().includes(q)) {
    score += WEIGHT.description;
  }

  return score;
}

/**
 * Scores every item, drops non-matches (score 0), and returns them ranked
 * highest-first. `Array.prototype.sort` is spec-guaranteed stable, so
 * items tied on score keep their original relative order rather than
 * shuffling unpredictably between renders.
 */
export function rankBySearchMatch<T>(
  query: string,
  items: T[],
  toSearchable: (item: T) => SearchableItem,
  targetAge?: number,
): T[] {
  return items
    .map((item) => ({ item, score: scoreSearchMatch(query, toSearchable(item), targetAge) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
