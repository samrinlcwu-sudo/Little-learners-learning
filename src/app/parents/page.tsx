import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconFeature } from "@/components/patterns/icon-feature";
import { parentValuePoints } from "@/config/audience-value-points";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "For Parents",
  description:
    "How Little Learners Learning is built for parents guiding their child's early learning — organized by subject, built for early years, careful with Qur'an content.",
  alternates: { canonical: `${siteConfig.url}/parents` },
};

export default function ParentsPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "For Parents" }]} />
        <Heading level="h1" className="mt-4">
          For Parents
        </Heading>
        <p className="mt-3 text-neutral-600">
          A tool built to help you guide your child&apos;s early learning —
          not just another app to hand them.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {parentValuePoints.map((point) => (
            <IconFeature key={point.title} {...point} headingAs="h2" />
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-8">
          <Badge variant="neutral">Not built yet</Badge>
          <p className="mt-3 text-sm text-neutral-600">
            Parent accounts, child profiles, and progress tracking haven&apos;t
            been built yet. Everything above describes how the platform is
            designed to work for parents today, using what already exists —
            not a promise of features that don&apos;t.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/learn">Explore Learning</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/resources">Browse Resources</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
