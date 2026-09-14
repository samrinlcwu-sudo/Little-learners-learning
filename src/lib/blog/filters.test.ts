import { describe, expect, it } from "vitest";
import { filterArticles, paginateArticles, sortArticles } from "./filters";
import type { BlogArticle } from "./types";

function makeArticle(overrides: Partial<BlogArticle> = {}): BlogArticle {
  return {
    id: "a1",
    slug: "a1",
    title: "Sample Article",
    excerpt: "A sample article about counting.",
    topic: "parent-guidance",
    tags: ["counting"],
    audience: ["parents"],
    sections: [{ heading: "Intro", paragraphs: ["Hello."] }],
    author: { name: "Little Learners Learning", role: "platform" },
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("filterArticles", () => {
  it("hides unpublished articles", () => {
    const items = [makeArticle({ id: "a", publicationStatus: "draft" }), makeArticle({ id: "b" })];
    expect(filterArticles(items, {})).toHaveLength(1);
  });

  it("filters by topic, category, audience, and tag", () => {
    const items = [
      makeArticle({ id: "a", topic: "classroom-ideas", category: "mathematics", audience: ["teachers"], tags: ["routines"] }),
      makeArticle({ id: "b", topic: "parent-guidance", audience: ["parents"], tags: ["counting"] }),
    ];
    expect(filterArticles(items, { topic: "classroom-ideas" })).toHaveLength(1);
    expect(filterArticles(items, { category: "mathematics" })).toHaveLength(1);
    expect(filterArticles(items, { audience: "teachers" })).toHaveLength(1);
    expect(filterArticles(items, { tag: "counting" })).toHaveLength(1);
  });

  it("matches the free-text query against title and excerpt", () => {
    const items = [makeArticle({ title: "Counting Through Play", excerpt: "Fun counting ideas" })];
    expect(filterArticles(items, { query: "counting" })).toHaveLength(1);
    expect(filterArticles(items, { query: "shapes" })).toHaveLength(0);
  });
});

describe("sortArticles", () => {
  it("sorts newest first by default", () => {
    const items = [makeArticle({ id: "old", createdAt: "2026-01-01" }), makeArticle({ id: "new", createdAt: "2026-02-01" })];
    expect(sortArticles(items).map((a) => a.id)).toEqual(["new", "old"]);
  });

  it("sorts oldest first", () => {
    const items = [makeArticle({ id: "old", createdAt: "2026-01-01" }), makeArticle({ id: "new", createdAt: "2026-02-01" })];
    expect(sortArticles(items, "oldest").map((a) => a.id)).toEqual(["old", "new"]);
  });

  it("sorts title A-Z", () => {
    const items = [makeArticle({ id: "b", title: "Banana" }), makeArticle({ id: "a", title: "Apple" })];
    expect(sortArticles(items, "title-asc").map((a) => a.id)).toEqual(["a", "b"]);
  });
});

describe("paginateArticles", () => {
  it("slices to a page and reports totals", () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    const result = paginateArticles(items, 1, 4);
    expect(result).toEqual({ items: [0, 1, 2, 3], page: 1, pageCount: 3, totalCount: 10 });
  });

  it("clamps an out-of-range page", () => {
    const items = [1, 2, 3];
    expect(paginateArticles(items, 99, 2).page).toBe(2);
  });

  it("handles an empty list", () => {
    expect(paginateArticles([], 1)).toEqual({ items: [], page: 1, pageCount: 1, totalCount: 0 });
  });
});
