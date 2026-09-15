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
 *
 * `og-image.png` is a 512x512 derivative of the brand logo (same artwork,
 * generated once via sharp), not the original ~2.3MB/1254x1254 source —
 * the declared `width`/`height` below already claimed 512x512, so social
 * crawlers were fetching an oversized file for what this metadata already
 * said it was. Performance audit, Prompt 79.
 */
const OG_IMAGE = {
  url: "/brand/og-image.png",
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
