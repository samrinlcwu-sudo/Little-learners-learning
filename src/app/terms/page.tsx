import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "Terms of Service",
  robots: { index: false, follow: true },
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
