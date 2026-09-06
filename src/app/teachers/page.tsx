import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "For Teachers",
  description: "Teacher registration and profiles are on the way.",
};

export default function TeachersPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "For Teachers" }]}
      title="For Teachers"
      description="Teacher registration and professional profiles haven't been built yet."
    />
  );
}
