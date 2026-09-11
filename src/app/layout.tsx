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
  icons: {
    icon: "/brand/little-learners-learning-logo.png",
  },
  // Site-wide fallback — a page that sets its own `openGraph`/`twitter`
  // (via buildSocialMetadata) replaces this entirely rather than merging
  // into it; every page that doesn't still gets a real, professional
  // preview instead of a blank one. See src/lib/seo/social-metadata.ts.
  ...buildSocialMetadata(siteConfig.name, siteConfig.description),
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
