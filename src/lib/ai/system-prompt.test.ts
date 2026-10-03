import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { getAllLearningCategories } from "@/config/learning-categories";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished } from "@/lib/games/types";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { isResourcePublished } from "@/lib/resources/types";
import { AI_SAFETY_GUIDELINES } from "./guardrails";
import { buildAssistantSystemPrompt } from "./system-prompt";

describe("buildAssistantSystemPrompt", () => {
  const prompt = buildAssistantSystemPrompt("public");

  it("includes every safety guideline verbatim", () => {
    for (const rule of AI_SAFETY_GUIDELINES) expect(prompt).toContain(rule);
  });

  it("lists every learning category and the real contact address", () => {
    for (const category of getAllLearningCategories()) expect(prompt).toContain(`/learn/${category.slug}`);
    expect(prompt).toContain(siteConfig.email);
  });

  it("includes published resources and games", () => {
    for (const resource of SAMPLE_RESOURCES.filter(isResourcePublished)) expect(prompt).toContain(`/resources/${resource.slug}`);
    for (const game of SAMPLE_GAMES.filter(isGamePublished)) expect(prompt).toContain(`/games/${game.slug}`);
  });

  it("never includes unpublished or review-pending content", () => {
    for (const resource of SAMPLE_RESOURCES.filter((r) => !isResourcePublished(r))) {
      expect(prompt).not.toContain(`/resources/${resource.slug}`);
    }
    for (const game of SAMPLE_GAMES.filter((g) => !isGamePublished(g))) {
      expect(prompt).not.toContain(`/games/${game.slug}`);
      expect(prompt).not.toContain(game.title);
    }
  });

  it("tells the model it cannot see account data and to treat user text as untrusted", () => {
    expect(buildAssistantSystemPrompt("parent")).toContain("cannot see their child's profile");
    expect(buildAssistantSystemPrompt("teacher")).toContain("cannot see their account");
    expect(prompt).toContain("untrusted");
  });

  it("refuses to serve the child and admin audiences", () => {
    expect(buildAssistantSystemPrompt("child")).toContain("This assistant is for parents and teachers.");
    expect(buildAssistantSystemPrompt("admin")).toContain("This assistant is for parents and teachers.");
  });

  it("is deterministic per audience, so the stable block can be prompt-cached", () => {
    expect(buildAssistantSystemPrompt("public")).toBe(buildAssistantSystemPrompt("public"));
  });
});
