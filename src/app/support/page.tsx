import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "Support",
  description: "Support channels are being set up.",
};

export default function SupportPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Support" }]}
      title="Support"
      description="A support channel hasn't been set up yet."
    />
  );
}
