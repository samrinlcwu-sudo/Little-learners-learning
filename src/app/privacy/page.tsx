import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: true },
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
      title="Privacy Policy"
      description="This policy has not been written yet. It will be published here once it is finalized — nothing on this site should be taken as a statement of our privacy practices until then."
    />
  );
}
