import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "Little Learners Learning's Terms of Service — not yet written or finalized.";

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}/terms` },
  ...buildSocialMetadata("Terms of Service — " + siteConfig.name, description, "/terms"),
};

export default function TermsPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
      title="Terms of Service"
      description="These terms have not been written yet. They will be published here once finalized — nothing on this site should be taken as a binding agreement until then."
    />
  );
}
