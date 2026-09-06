import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { primaryNav } from "@/config/nav";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    ...primaryNav.map((link) => ({
      url: `${siteConfig.url}${link.href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
