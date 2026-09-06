import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "For Parents",
  description: "Information for parents is on the way.",
};

export default function ParentsPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "For Parents" }]}
      title="For Parents"
      description="Parent accounts, child profiles, and progress tracking haven't been built yet."
    />
  );
}
