import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  NotebookPen,
  Library,
  Layers,
  ShieldCheck,
  Users,
  Accessibility,
  Gamepad2,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DecorativeBlob } from "@/components/ui/decorative-blob";
import { IconFeature } from "@/components/patterns/icon-feature";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { parentValuePoints, teacherValuePoints } from "@/config/audience-value-points";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { isResourcePublished, type ResourceType } from "@/lib/resources/types";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished } from "@/lib/games/types";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "Little Learners Learning is an early-years learning platform bringing literacy, math, life skills, creativity, and foundational Qur'an learning together — built for parents and teachers, not just kids.";

export const metadata: Metadata = {
  description,
  alternates: { canonical: siteConfig.url },
  ...buildSocialMetadata(siteConfig.name, description),
};

const resourceFormats: { name: string; description: string; icon: typeof FileText; resourceType: ResourceType }[] = [
  {
    name: "Worksheets",
    description: "Printable practice sheets for hands-on learning at home or in the classroom.",
    icon: FileText,
    resourceType: "worksheet",
  },
  {
    name: "Activities",
    description: "Guided exercises that reinforce a subject through doing, not just reading.",
    icon: NotebookPen,
    resourceType: "activity",
  },
  {
    name: "Ebooks",
    description: "Age-appropriate reading material for early learners.",
    icon: Library,
    resourceType: "ebook",
  },
];

/** A representative spread across all three subject groups — the full set of 16 stays on /learn, linked below. */
const FEATURED_CATEGORY_SLUGS = [
  "english-early-literacy",
  "mathematics",
  "life-skills",
  "creativity",
  "quran-nazra",
  "arabic-letters",
  "learning-games",
  "puzzles",
] as const;

const FEATURED_CATEGORY_TONE: Record<string, "primary" | "secondary" | "accent"> = {
  "english-early-literacy": "primary",
  mathematics: "primary",
  "life-skills": "primary",
  creativity: "primary",
  "quran-nazra": "secondary",
  "arabic-letters": "secondary",
  "learning-games": "accent",
  puzzles: "accent",
};

const whyPillars = [
  {
    icon: Layers,
    title: "One platform, many subjects",
    description: "Core early-learning subjects and Qur'an & Arabic foundations, organized in one place instead of scattered apps.",
  },
  {
    icon: ShieldCheck,
    title: "Careful with religious content",
    description: "Qur'an and Islamic content is reviewed by a qualified person before publishing — never generated or altered automatically.",
  },
  {
    icon: Users,
    title: "Built for the adults too",
    description: "A shared tool for parents and teachers guiding a child's learning, not only a standalone kids' app.",
  },
  {
    icon: Accessibility,
    title: "Accessible by design",
    description: "Built with keyboard navigation, visible focus states, and screen-reader-friendly structure from the start.",
  },
];

const ctaLinks = [
  { label: "Explore Learning", href: "/learn" },
  { label: "Explore Resources", href: "/resources" },
  { label: "Explore Games", href: "/games" },
  { label: "For Parents", href: "/parents" },
  { label: "For Teachers", href: "/teachers" },
];

export default function Home() {
  const publishedResources = SAMPLE_RESOURCES.filter(isResourcePublished);
  const publishedGamesCount = SAMPLE_GAMES.filter(isGamePublished).length;
  const featuredCategories = FEATURED_CATEGORY_SLUGS.map((slug) => getLearningCategoryBySlug(slug)).filter(
    (category): category is NonNullable<typeof category> => category !== undefined,
  );

  return (
    <>
      {/* Hero — warm, light, and the only place the display headline appears */}
      <Section surface="sunken" className="relative overflow-hidden">
        <DecorativeBlob
          tone="primary"
          className="pointer-events-none absolute -right-24 -top-24 size-96 opacity-30"
        />
        <DecorativeBlob
          tone="secondary"
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 opacity-20"
        />
        <Container className="relative max-w-3xl text-center">
          <Badge variant="primary">Early-Years Learning Platform</Badge>
          <Heading level="display" as="h1" className="mt-5">
            One place to guide how your child learns.
          </Heading>
          <p className="text-lead mx-auto mt-5 max-w-xl text-neutral-600">
            Little Learners Learning brings early literacy, math, life skills,
            creativity, and foundational Qur&apos;an learning together —
            built for parents and teachers, not just kids.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/learn">Explore Learning</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/parents">For Parents</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-neutral-500">
            New subjects, resources, and games are added as the library grows.
          </p>
        </Container>
      </Section>

      {/* Learning categories — clean white reading surface, a curated preview of the full subject map on /learn */}
      <Section>
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Subjects</Eyebrow>
            <Heading level="h2" className="mt-2">
              What your child can learn
            </Heading>
            <p className="mt-3 text-neutral-600">
              16 subjects to explore, real worksheets and games to try, and
              dashboards for parents and teachers — all organized in one
              place, growing as the platform does.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/learn/${category.slug}`}
                className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
              >
                <Card interactive className="h-full p-5">
                  <IconFeature
                    icon={category.icon}
                    title={category.name}
                    description={category.description}
                    headingAs="h3"
                    tone={FEATURED_CATEGORY_TONE[category.slug] ?? "primary"}
                  />
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link href="/learn">
                Explore all 16 subjects
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Learning materials — soft terracotta tint, a contrasting band before Games */}
      <Section surface="tint-secondary">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow tone="secondary">Formats</Eyebrow>
            <Heading level="h2" className="mt-2">
              Learning materials
            </Heading>
            <p className="mt-3 text-neutral-600">
              Worksheets, activities, and ebooks — real sample resources exist
              in every format today, with more added as the library grows.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {resourceFormats.map((format) => {
              const count = publishedResources.filter((r) => r.resourceType === format.resourceType).length;
              return (
                <Card key={format.name} className="p-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700">
                    <format.icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardContent className="flex flex-col gap-3 p-0 pt-4">
                    <h3 className="font-display text-lg font-semibold text-ink">{format.name}</h3>
                    <p className="text-sm text-neutral-600">{format.description}</p>
                    <Badge variant={count > 0 ? "success" : "neutral"} className="w-fit">
                      {count > 0 ? `${count} sample${count === 1 ? "" : "s"} to browse` : "Coming soon"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-8">
            <Button variant="outline" asChild>
              <Link href="/resources">Explore Resources</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Games — soft gold tint, a touch more playful, still restrained */}
      <Section surface="tint-accent" className="relative overflow-hidden">
        <DecorativeBlob
          tone="accent"
          className="pointer-events-none absolute -right-16 -bottom-24 size-72 opacity-30"
        />
        <Container className="relative max-w-3xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-200/70 text-accent-800">
            <Gamepad2 className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h2" className="mt-5">
            The Learning Games Hub
          </Heading>
          <p className="mt-3 text-neutral-600">
            {publishedGamesCount} free games are ready to play today —
            starting with Letter Match and Number Memory — each one built
            around a specific learning goal, not random entertainment.
          </p>
          <div className="mt-6">
            <Button variant="outline" asChild>
              <Link href="/games">Explore Games</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Parents — soft teal tint, calm and trustworthy */}
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
                <Link href="/parents">For Parents</Link>
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

      {/* Teachers — warm cream, echoing the hero to bookend the page */}
      <Section surface="sunken">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <Eyebrow tone="secondary">For educators</Eyebrow>
            <Heading level="h2" className="mt-2">
              For Teachers
            </Heading>
            <p className="mt-3 max-w-md text-neutral-600">
              A professional home for your teaching profile, classroom-ready
              resources, and the expertise you bring to early-years education.
            </p>
            <Badge variant="success" className="mt-4 w-fit">
              Registration is open
            </Badge>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href="/teachers">For Teachers</Link>
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

      {/* Why — clean white, a calm close before the CTA */}
      <Section>
        <Container>
          <Heading level="h2" className="max-w-xl">
            Why Little Learners Learning
          </Heading>
          <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {whyPillars.map((pillar) => (
              <IconFeature key={pillar.title} {...pillar} tone="neutral" />
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA — strongest brand treatment on the page */}
      <Section surface="primary">
        <Container className="max-w-2xl text-center">
          <Heading level="h2" className="text-white">
            See where Little Learners Learning is headed
          </Heading>
          <p className="mt-3 text-primary-100">
            The platform is under active development. Here&apos;s where to
            look next.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {ctaLinks.map((link) => (
              <Button
                key={link.href}
                variant="outline"
                asChild
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
