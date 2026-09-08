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
  "How Little Learners Learning works for teachers — create a professional profile today, browse classroom-ready resources, and see what's still ahead.";

export const metadata: Metadata = {
  title: "For Teachers",
  description,
  alternates: { canonical: `${siteConfig.url}/teachers` },
  ...buildSocialMetadata("For Teachers — " + siteConfig.name, description, "/teachers"),
};

const availableNow = [
  {
    title: "Create a teacher account and professional profile",
    description: "Register, then add your bio, experience, subjects, and teaching interests — all live today.",
  },
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
    title: "Human-reviewed profile verification",
    description: "A \"verified\" badge on your profile once a real review process is connected.",
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
        description="A professional home for your teaching profile, classroom-ready resources, and the expertise you bring to early-years education."
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
            <Badge variant="success">Registration is open</Badge>
            <p className="mt-3 text-sm text-neutral-600">
              Create a teacher account and build your professional profile —
              it works in your browser today. Account creation isn&apos;t
              connected to a live backend yet, so your details stay on this
              device until real accounts are, but the profile itself is
              genuinely yours to fill in.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/teachers/register">Register as a teacher</Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
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
