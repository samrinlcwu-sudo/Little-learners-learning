import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Every /admin page already sets `robots: { index: false, follow: false }`
 * itself (docs/ADMIN_ARCHITECTURE.md) — that per-page meta tag is what
 * actually keeps a crawled admin page out of search results. The
 * `disallow` here is defense in depth on top of that, not a substitute for
 * it (and never a substitute for Proxy's real access control, src/proxy.ts,
 * which blocks the request itself): it also stops a well-behaved crawler
 * from requesting `/admin/*` at all. Added during the Prompt 68 checkpoint.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
