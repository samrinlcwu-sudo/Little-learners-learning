import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { siteConfig } from "@/config/site";

/**
 * A regression guard for exactly what Prompt 87's privacy checklist asks
 * for: the public sitemap must never list a private route, regardless of
 * what gets added to it later. Every URL here is submitted to search
 * engines and crawled by anyone, so this is a real privacy boundary, not
 * just an SEO one — it must hold even as new content types are added to
 * the sitemap in the future, not just against today's sample data (which
 * happens to have no unpublished items to accidentally leak).
 */
const PRIVATE_PATH_PREFIXES = [
  "/admin",
  "/dashboard",
  "/account",
  "/teachers/dashboard",
  "/teachers/register",
];

describe("sitemap", () => {
  const entries = sitemap();

  it("is non-empty and includes the homepage", () => {
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((entry) => entry.url === siteConfig.url)).toBe(true);
  });

  it("every url is on this site's own origin", () => {
    for (const entry of entries) {
      expect(entry.url.startsWith(siteConfig.url)).toBe(true);
    }
  });

  it("never lists a private/authenticated route", () => {
    for (const entry of entries) {
      const path = entry.url.slice(siteConfig.url.length);
      for (const prefix of PRIVATE_PATH_PREFIXES) {
        expect(path.startsWith(prefix)).toBe(false);
      }
    }
  });

  it("has no duplicate urls", () => {
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
