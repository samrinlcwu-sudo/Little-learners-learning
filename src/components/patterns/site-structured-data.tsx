import { siteConfig } from "@/config/site";
import { toJsonLdHtml } from "@/lib/seo/json-ld";

/**
 * The two schemas that describe the site itself, not any one page —
 * rendered once, site-wide, from src/app/layout.tsx. Only real, verifiable
 * facts: name, url, logo, and description already used elsewhere in
 * metadata. No founding date, no social profiles (`sameAs`), no address or
 * phone — none of those exist, so none are claimed.
 */
function SiteStructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/little-learners-learning-logo.png`,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdHtml(organization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdHtml(website) }} />
    </>
  );
}

export { SiteStructuredData };
