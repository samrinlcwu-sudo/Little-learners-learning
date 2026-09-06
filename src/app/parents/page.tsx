import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconFeature } from "@/components/patterns/icon-feature";
import { PageHeader } from "@/components/patterns/page-header";
import { CapabilityList } from "@/components/patterns/capability-list";
import { parentValuePoints } from "@/config/audience-value-points";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "For Parents",
  description:
    "How Little Learners Learning is built for parents guiding their child's early learning — organized by subject, built for early years, careful with Qur'an content.",
  alternates: { canonical: `${siteConfig.url}/parents` },
};

const availableNow = [
  {
    title: "Browse the Learning Hub by subject",
    description: "16 subject areas mapped out across three groups — content is still being added to each one.",
  },
  {
    title: "Play free learning games",
    description: "5 games playable today, each built around one skill — letter recognition, counting, shapes, colors, or memory.",
  },
  {
    title: "Search and filter the Resource Library",
    description: "Find worksheets, activities, and ebooks by subject, age, and difficulty — even while the catalog is small.",
  },
  {
    title: "See what each resource actually teaches",
    description: "Every item shows its age range, difficulty, and learning objective before you open it.",
  },
];

const comingLater = [
  {
    title: "Downloadable files",
    description: "Most resources today are sample records without an attached file — downloads are added as real content ships.",
  },
  {
    title: "Parent accounts & child profiles",
    description: "A way to save a profile for your child and personalize what you see.",
  },
  {
    title: "Progress tracking",
    description: "Seeing what your child has completed and where they're headed next.",
  },
];

export default function ParentsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "For Parents" }]}
        eyebrow="For families"
        title="For Parents"
        description="A tool built to help you guide your child's early learning — not just another app to hand them."
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {parentValuePoints.map((point) => (
              <Card key={point.title} className="p-5">
                <IconFeature {...point} headingAs="h2" />
              </Card>
            ))}
          </div>

          <div className="mt-14">
            <Heading level="h2">What you can do here</Heading>
            <p className="mt-2 text-neutral-600">
              A clear line between what already works and what&apos;s still being built.
            </p>
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              <CapabilityList title="Today" status="available" items={availableNow} />
              <CapabilityList title="Ahead" status="coming" items={comingLater} />
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-neutral-200 pt-8">
            <Button asChild>
              <Link href="/learn">Explore Learning</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/resources">Browse Resources</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/games">Play Games</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
