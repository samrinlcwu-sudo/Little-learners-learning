import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconFeature } from "@/components/patterns/icon-feature";
import { teacherValuePoints } from "@/config/audience-value-points";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "For Teachers",
  description:
    "How Little Learners Learning is being built for teachers — professional profiles, sharing expertise, and room to grow as the platform develops.",
  alternates: { canonical: `${siteConfig.url}/teachers` },
};

export default function TeachersPage() {
  return (
    <Section>
      <Container className="max-w-3xl">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "For Teachers" }]} />
        <Heading level="h1" className="mt-4">
          For Teachers
        </Heading>
        <p className="mt-3 text-neutral-600">
          A future home for professional profiles, teaching resources, and
          the expertise you bring to early-years education.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {teacherValuePoints.map((point) => (
            <IconFeature key={point.title} {...point} headingAs="h2" />
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-8">
          <Badge variant="neutral">Registration isn&apos;t open yet</Badge>
          <p className="mt-3 text-sm text-neutral-600">
            Teacher registration and professional profiles haven&apos;t been
            built yet. Everything above describes the plan for teachers, not
            a feature you can sign up for today.
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
