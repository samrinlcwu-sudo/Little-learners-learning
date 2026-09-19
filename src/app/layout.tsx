import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SkipLink } from "@/components/ui/skip-link";
import { SiteStructuredData } from "@/components/patterns/site-structured-data";
import { AiAssistant } from "@/components/patterns/ai-assistant";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // A dedicated small favicon, not the full brand logo file — browsers
  // fetch this on every page load, so it's a real, measurable amount of
  // unnecessary network weight if it's the same 1254x1254, ~2.3MB source
  // image used for print-quality brand usage elsewhere. Generated once
  // from that same source (public/brand/favicon.png, 64x64) — same
  // artwork, no visual change, ~99% smaller.
  icons: {
    icon: "/brand/favicon.png",
  },
  // Site-wide fallback — a page that sets its own `openGraph`/`twitter`
  // (via buildSocialMetadata) replaces this entirely rather than merging
  // into it; every page that doesn't still gets a real, professional
  // preview instead of a blank one. See src/lib/seo/social-metadata.ts.
  ...buildSocialMetadata(siteConfig.name, siteConfig.description),
  // Renders <meta name="google-site-verification" content="..."> only
  // once a real Search Console property exists and its code is set here —
  // omitted (not a fake/placeholder value) until then. See
  // docs/SEARCH_MONITORING_PLAN.md, "Search Console setup."
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteStructuredData />
        <SkipLink />
        <AiAssistant>
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
            {children}
          </main>
          <SiteFooter />
        </AiAssistant>
      </body>
    </html>
  );
}
