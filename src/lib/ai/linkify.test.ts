import { describe, expect, it } from "vitest";
import { linkifyInternalPaths } from "./linkify";

const links = (text: string) =>
  linkifyInternalPaths(text)
    .filter((s) => s.type === "link")
    .map((s) => s.value);

describe("linkifyInternalPaths", () => {
  it("links this site's own section paths", () => {
    expect(links("Try /learn/mathematics or the /games page.")).toEqual(["/learn/mathematics", "/games"]);
  });

  it("does not swallow trailing punctuation", () => {
    expect(links("See /resources/counting-animals-worksheet.")).toEqual(["/resources/counting-animals-worksheet"]);
    expect(links("Visit (/faq), then /support!")).toEqual(["/faq", "/support"]);
  });

  it("never links external URLs or paths on other hosts", () => {
    expect(links("Go to https://example.com/learn/maths")).toEqual([]);
    expect(links("see example.com/games")).toEqual([]);
  });

  it("never links unknown or private-looking roots", () => {
    expect(links("/admin /api/assistant /account /secret")).toEqual([]);
  });

  it("does not match inside a longer word or path", () => {
    expect(links("our /learning plan, and/or /gamesplus")).toEqual([]);
  });

  it("round-trips the original text", () => {
    const text = "Start at /learn, then /games/shape-match — enjoy!";
    expect(linkifyInternalPaths(text).map((s) => s.value).join("")).toBe(text);
  });
});
