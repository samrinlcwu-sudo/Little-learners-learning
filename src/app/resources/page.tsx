import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "Resources",
  description: "Worksheets, activities, and ebooks are on the way.",
};

export default function ResourcesPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Resources" }]}
      title="Resources"
      description="Worksheets, activities, and ebooks will live here. This library hasn't been built yet."
    />
  );
}
