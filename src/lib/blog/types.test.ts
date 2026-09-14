import { describe, expect, it } from "vitest";
import { isArticlePublished, type BlogArticle } from "./types";

function makeArticle(overrides: Partial<BlogArticle> = {}): BlogArticle {
  return {
    id: "a1",
    slug: "a1",
    title: "Sample Article",
    excerpt: "A sample article.",
    topic: "parent-guidance",
    tags: [],
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

describe("isArticlePublished", () => {
  it("hides a draft article", () => {
    expect(isArticlePublished(makeArticle({ publicationStatus: "draft" }))).toBe(false);
  });

  it("hides an in-review article", () => {
    expect(isArticlePublished(makeArticle({ publicationStatus: "review" }))).toBe(false);
  });

  it("hides an archived article", () => {
    expect(isArticlePublished(makeArticle({ publicationStatus: "archived" }))).toBe(false);
  });

  it("shows a published article with no religious-review requirement", () => {
    expect(isArticlePublished(makeArticle())).toBe(true);
  });

  it("hides a published quran-nazra-guidance article pending religious review", () => {
    expect(
      isArticlePublished(makeArticle({ topic: "quran-nazra-guidance", religiousReview: "pending-review" })),
    ).toBe(false);
  });

  it("shows a published quran-nazra-guidance article once verified", () => {
    expect(
      isArticlePublished(makeArticle({ topic: "quran-nazra-guidance", religiousReview: "verified" })),
    ).toBe(true);
  });

  it("does not require religious review for an unrelated topic", () => {
    expect(isArticlePublished(makeArticle({ topic: "classroom-ideas", religiousReview: "pending-review" }))).toBe(
      true,
    );
  });
});
