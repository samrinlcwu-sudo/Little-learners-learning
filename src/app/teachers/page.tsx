import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconFeature } from "@/components/patterns/icon-feature";
import { PageHeader } from "@/components/patterns/page-header";
import { CapabilityList } from "@/components/patterns/capability-list";
import { teacherValuePoints } from "@/config/audience-value-points";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "How Little Learners Learning is being built for teachers — professional profiles, sharing expertise, and room to grow as the platform develops.";

export const metadata: Metadata = {
  title: "For Teachers",
  description,
  alternates: { canonical: `${siteConfig.url}/teachers` },
  ...buildSocialMetadata("For Teachers — " + siteConfig.name, description, "/teachers"),
};

const availableNow = [
  {
    title: "Browse classroom-ready material by subject and age",
    description: "The Learning Hub and Resource Library are both live and organized for quick browsing.",
  },
  {
    title: "Use the learning games as a focused activity",
    description: "5 free games playable today, each tied to one specific skill rather than open-ended screen time.",
  },
  {
    title: "See exactly what a resource teaches before using it",
    description: "Age range, difficulty, and learning objective are shown up front on every item.",
  },
];

const comingLater = [
  {
    title: "Teacher accounts & professional profiles",
    description: "A profile for your experience, subjects, and areas of expertise.",
  },
  {
    title: "Contributing your own resources",
    description: "Sharing material you've made and being discoverable by families looking for your specialties.",
  },
  {
    title: "A teacher community",
    description: "Professional development and connection with other early-years educators.",
  },
];

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

          <div className="mt-12 border-t border-neutral-200 pt-8">
            <Badge variant="neutral">Registration isn&apos;t open yet</Badge>
            <p className="mt-3 text-sm text-neutral-600">
              Teacher registration and professional profiles haven&apos;t been
              built yet — the button below reflects that honestly rather
              than linking to a sign-up form that doesn&apos;t exist.
            </p>
            <Button className="mt-4" disabled title="Coming soon">
              Register as a teacher
            </Button>
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
