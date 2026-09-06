import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "About",
  description: "About Little Learners Learning.",
};

export default function AboutPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "About" }]}
      title="About"
      description="Our story is still being written. This page will share it once it's ready."
    />
  );
}
