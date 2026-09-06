import type { Metadata } from "next";
import { ComingSoonSection } from "@/components/patterns/coming-soon-section";

export const metadata: Metadata = {
  title: "Games",
  description: "Learning games are on the way.",
};

export default function GamesPage() {
  return (
    <ComingSoonSection
      breadcrumb={[{ label: "Home", href: "/" }, { label: "Games" }]}
      title="Games"
      description="Interactive learning games — puzzles, mazes, and more — haven't been built yet."
    />
  );
}
