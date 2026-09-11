import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/patterns/page-header";
import { CapabilityList } from "@/components/patterns/capability-list";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "How families can start and track an application with Little Learners Learning — honestly describing what's ready today and what's still ahead, with no assumed programs, dates, or fees.";

export const metadata: Metadata = {
  title: "Admissions",
  description,
  alternates: { canonical: `${siteConfig.url}/admissions` },
  ...buildSocialMetadata("Admissions — " + siteConfig.name, description, "/admissions"),
};

const availableNow = [
  {
    title: "Start a draft application",
    description: "Save one for your child from your dashboard — nothing is submitted until you choose to.",
  },
  {
    title: "Choose from all 16 real subjects",
    description: "Pick the learning interests that matter to your family from the same subjects used across the site.",
  },
  {
    title: "Get a real reference number",
    description: "Once you submit, your application keeps a real reference and a status you can check anytime.",
  },
  {
    title: "Withdraw anytime",
    description: "Change your mind before or after submitting — withdrawing is always available.",
  },
];

const comingLater = [
  {
    title: "A real admissions review",
    description: "Applications aren't reviewed by a person yet — nothing can be marked under review, accepted, or declined today.",
  },
  {
    title: "Program, date, and fee details",
    description: "Specific learning programs, start dates, tuition, and locations will be added here once they're actually decided — nothing is assumed yet.",
  },
  {
    title: "Status updates",
    description: "Email or other notifications about your application's status, once a real review process exists.",
  },
];

export default function AdmissionsPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
        eyebrow="Getting started"
        title="Admissions"
        description="Little Learners Learning doesn't run a formal enrollment process yet — this page describes what's actually ready today, and lets you start a draft application whenever you'd like."
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <div>
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
              <Link href="/dashboard/applications">Start an application</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Go to your dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/learn">Explore Learning</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
