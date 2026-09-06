import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconFeature } from "@/components/patterns/icon-feature";
import { PageHeader } from "@/components/patterns/page-header";
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
    </>
  );
}
