import type { Metadata } from "next";
import Link from "next/link";
import { FileText, NotebookPen, Library, Gamepad2, Compass, ShieldCheck, Accessibility } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DecorativeBlob } from "@/components/ui/decorative-blob";
import { IconFeature } from "@/components/patterns/icon-feature";
import { learningCategoryGroups } from "@/config/learning-categories";
import { parentValuePoints, teacherValuePoints } from "@/config/audience-value-points";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "What Little Learners Learning is, who it's for, and the approach behind an early-years learning platform built for parents and teachers.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: `${siteConfig.url}/about` },
  ...buildSocialMetadata("About — " + siteConfig.name, description, "/about"),
};

const offerings = [
  {
    icon: FileText,
    title: "Worksheets & activities",
    description: "Printable, hands-on material organized by subject and age.",
  },
  {
    icon: Library,
    title: "Ebooks",
    description: "Age-appropriate reading material for early learners.",
  },
  {
    icon: Gamepad2,
    title: "Learning games",
    description: "Short, focused games — each built around one specific skill.",
  },
  {
    icon: NotebookPen,
    title: "The Learning Hub",
    description: "A subject-by-subject map of everything the platform covers.",
  },
];

const approachPillars = [
  {
    icon: Compass,
    title: "Organized, not overwhelming",
    description: "One structure across subjects, ages, and formats — instead of scattered, disconnected content.",
    tone: "primary" as const,
  },
  {
    icon: ShieldCheck,
    title: "Careful with religious content",
    description: "Qur'an and Arabic material is reviewed by a qualified person before publishing — never generated or shown automatically.",
    tone: "secondary" as const,
  },
  {
    icon: Accessibility,
    title: "Accessible from the start",
    description: "Keyboard navigation, visible focus states, and screen-reader-friendly structure, built in rather than added later.",
    tone: "accent" as const,
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <Section surface="sunken" className="relative overflow-hidden">
        <DecorativeBlob
          tone="primary"
          className="pointer-events-none absolute -right-20 -top-20 size-80 opacity-25"
        />
        <Container className="relative max-w-3xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <Eyebrow className="mt-5">About the platform</Eyebrow>
          <Heading level="h1" className="mt-2">
            An early-years learning platform, built for the adults guiding it too.
          </Heading>
          <p className="text-lead mt-4 max-w-2xl text-neutral-600">
            Little Learners Learning brings early literacy, math, life skills,
            creativity, and foundational Qur&apos;an &amp; Arabic learning
            together in one place — organized for parents and teachers, not
            just handed to a child alone.
          </p>
        </Container>
      </Section>

      {/* Our Purpose */}
      <Section>
        <Container className="max-w-3xl">
          <Heading level="h2">Our purpose</Heading>
          <p className="mt-4 text-neutral-600">
            The earliest years of learning set the pattern for everything
            that follows — how a child feels about letters, numbers, and
            trying something new. Most families juggle that across
            scattered apps, printouts, and unrelated websites. Little
            Learners Learning exists to bring it into one organized place:
            a single map of subjects, activities, and games, built
            specifically for early-years learners rather than adapted down
            from material meant for older kids.
          </p>
        </Container>
      </Section>

      {/* What We Offer */}
      <Section surface="tint-secondary">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow tone="secondary">What we offer</Eyebrow>
            <Heading level="h2" className="mt-2">
              Formats built around how young children learn
            </Heading>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {offerings.map((item) => (
              <Card key={item.title} className="p-5">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-sm text-neutral-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Learning Areas */}
      <Section>
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Learning areas</Eyebrow>
            <Heading level="h2" className="mt-2">
              Every subject, organized in one map
            </Heading>
            <p className="mt-3 text-neutral-600">
              Content is grouped into three areas — core early-learning
              subjects, Qur&apos;an &amp; Arabic foundations, and hands-on
              activities and play.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {learningCategoryGroups.map((group) => (
              <div key={group.group} className="rounded-xl border border-neutral-200 p-5">
                <Heading level="h5" as="h3">
                  {group.group}
                </Heading>
                <p className="mt-1 text-sm text-neutral-600">
                  {group.categories.length} subject{group.categories.length === 1 ? "" : "s"}, ages{" "}
                  {Math.min(...group.categories.map((c) => c.ageRange.minYears))}–
                  {Math.max(...group.categories.map((c) => c.ageRange.maxYears))}.
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link href="/learn">Explore the Learning Hub</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* For Families */}
      <Section surface="tint-primary">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <Eyebrow>For families</Eyebrow>
            <Heading level="h2" className="mt-2">
              For Parents
            </Heading>
            <p className="mt-3 max-w-md text-neutral-600">
              A tool built to help you guide your child&apos;s early
              learning — not just another app to hand them. Add a child
              profile and see their real progress in your dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/parents">See the Parents page</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Open your dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {parentValuePoints.map((point) => (
              <Card key={point.title} className="p-5">
                <IconFeature {...point} />
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* For Teachers */}
      <Section surface="sunken">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <Eyebrow tone="secondary">For educators</Eyebrow>
            <Heading level="h2" className="mt-2">
              For Teachers
            </Heading>
            <p className="mt-3 max-w-md text-neutral-600">
              A professional home for your teaching profile, classroom-ready
              resources, and the expertise you bring to early-years education
              — plus a directory where families can find you once your
              profile is public and reviewed.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/teachers">See the Teachers page</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/teachers/dashboard">Open your dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {teacherValuePoints.map((point) => (
              <Card key={point.title} className="p-5">
                <IconFeature {...point} tone="secondary" />
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Our Approach */}
      <Section>
        <Container>
          <Heading level="h2" className="max-w-xl">
            Our approach
          </Heading>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {approachPillars.map((pillar) => (
              <IconFeature key={pillar.title} {...pillar} />
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section surface="primary">
        <Container className="max-w-2xl text-center">
          <Heading level="h2" className="text-white">
            See it for yourself
          </Heading>
          <p className="mt-3 text-primary-100">
            Browse what&apos;s live today, or check the FAQ for what&apos;s
            still being built.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              asChild
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/learn">Explore Learning</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/faq">Read the FAQ</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
