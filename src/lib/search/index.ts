import { getAllLearningCategories } from "@/config/learning-categories";
import { SAMPLE_CONTENT } from "@/lib/content/sample-content";
import { isPubliclyVisible } from "@/lib/content/types";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { isResourcePublished } from "@/lib/resources/types";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished } from "@/lib/games/types";

export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  group: string;
}

/**
 * Every route a visitor might actually want to jump to directly, in plain
 * language rather than nav labels — someone searching "help" should find
 * Support even though the header calls it that too.
 */
const STATIC_PAGES: SearchEntry[] = [
  { title: "Learn", description: "Browse every subject the platform covers.", href: "/learn", group: "Pages" },
  { title: "Resources", description: "Worksheets, activities, and ebooks.", href: "/resources", group: "Pages" },
  { title: "Games", description: "Free learning games for early years.", href: "/games", group: "Pages" },
  { title: "For Parents", description: "How the platform works for parents.", href: "/parents", group: "Pages" },
  { title: "For Teachers", description: "How the platform works for teachers.", href: "/teachers", group: "Pages" },
  { title: "About", description: "What Little Learners Learning is and why it exists.", href: "/about", group: "Pages" },
  { title: "FAQ", description: "Answers to common questions.", href: "/faq", group: "Pages" },
  { title: "Support", description: "Get help or send a message.", href: "/support", group: "Pages" },
  { title: "Dashboard", description: "Manage child profiles and jump into learning.", href: "/dashboard", group: "Pages" },
];

/**
 * A plain in-memory index built once from the same published/verified data
 * every page already renders from — nothing here is a live query, and
 * nothing bypasses the religious-review gate that governs what's publicly
 * visible elsewhere on the site.
 */
function buildSearchIndex(): SearchEntry[] {
  const categories: SearchEntry[] = getAllLearningCategories().map((category) => ({
    title: category.name,
    description: category.description,
    href: `/learn/${category.slug}`,
    group: "Subjects",
  }));

  const content: SearchEntry[] = SAMPLE_CONTENT.filter(isPubliclyVisible).map((item) => ({
    title: item.title,
    description: item.description,
    href: `/learn/${item.category}`,
    group: "Learning Hub",
  }));

  const resources: SearchEntry[] = SAMPLE_RESOURCES.filter(isResourcePublished).map((resource) => ({
    title: resource.title,
    description: resource.description,
    href: `/resources/${resource.slug}`,
    group: "Resources",
  }));

  const games: SearchEntry[] = SAMPLE_GAMES.filter(isGamePublished).map((game) => ({
    title: game.title,
    description: game.description,
    href: `/games/${game.slug}`,
    group: "Games",
  }));

  return [...STATIC_PAGES, ...categories, ...content, ...resources, ...games];
}

export const SEARCH_INDEX: SearchEntry[] = buildSearchIndex();

/** Simple substring match over title + description — plenty for a catalog this size; swap for a real search engine if it ever grows past that. */
export function searchSite(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SEARCH_INDEX.filter((entry) => `${entry.title} ${entry.description}`.toLowerCase().includes(q)).slice(
    0,
    limit,
  );
}
