import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { primaryNav } from "@/config/nav";
import { getAllLearningCategories } from "@/config/learning-categories";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { isResourcePublished } from "@/lib/resources/types";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished } from "@/lib/games/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteConfig.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    ...primaryNav.map((link) => ({
      url: `${siteConfig.url}${link.href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...getAllLearningCategories().map((category) => ({
      url: `${siteConfig.url}/learn/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...SAMPLE_RESOURCES.filter(isResourcePublished).map((resource) => ({
      url: `${siteConfig.url}/resources/${resource.slug}`,
      lastModified: resource.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...SAMPLE_GAMES.filter(isGamePublished).map((game) => ({
      url: `${siteConfig.url}/games/${game.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
