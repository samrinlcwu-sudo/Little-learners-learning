import { siteConfig } from "@/config/site";

/**
 * The one image every social preview uses today — the brand logo. Next.js
 * treats `openGraph`/`twitter` as whole objects: a page that sets its own
 * `openGraph` REPLACES the site-wide default entirely rather than merging
 * into it (confirmed in Next's own docs — "duplicate keys are replaced").
 * That means a page setting only `{ title, description }` would silently
 * lose the image, type, and locale. This helper always returns the full
 * object, so no page can accidentally drop a field by only overriding
 * part of it. See docs/SEO_ARCHITECTURE.md.
 */
const OG_IMAGE = {
  url: "/brand/little-learners-learning-logo.png",
  width: 512,
  height: 512,
  alt: siteConfig.name,
};

export function buildSocialMetadata(title: string, description: string, path?: string) {
  return {
    openGraph: {
      type: "website" as const,
      siteName: siteConfig.name,
      title,
      description,
      url: path ? `${siteConfig.url}${path}` : siteConfig.url,
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary" as const,
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
