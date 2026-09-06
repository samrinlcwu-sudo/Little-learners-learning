import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "Learn",
  description: "The Little Learners Learning subject library is being built.",
};

export default function LearnPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Learn" }]}
      title="Learn"
      description="Our subject library — English & literacy, math, life skills, and more — is still being built. Check back soon."
    />
  );
}
