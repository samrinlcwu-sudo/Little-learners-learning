import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconFeature } from "@/components/patterns/icon-feature";
import { PageHeader } from "@/components/patterns/page-header";
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
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "For Teachers" }]}
        eyebrow="For educators"
        title="For Teachers"
        description="A future home for professional profiles, teaching resources, and the expertise you bring to early-years education."
        surface="sunken"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {teacherValuePoints.map((point) => (
              <Card key={point.title} className="p-5">
                <IconFeature {...point} tone="secondary" headingAs="h2" />
              </Card>
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
    </>
  );
}
