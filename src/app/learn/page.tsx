import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";
import { learningCategoryGroups, getAllLearningCategories } from "@/config/learning-categories";
import { LearningCard } from "@/components/patterns/learning-card";
import { LearningContentBrowser } from "@/components/patterns/learning-content-browser";
import { SAMPLE_CONTENT } from "@/lib/content/sample-content";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Browse Little Learners Learning's subject areas — English & literacy, math, life skills, creativity, and foundational Qur'an & Arabic learning.",
  alternates: { canonical: `${siteConfig.url}/learn` },
};

const categoryNameBySlug = new Map(
  getAllLearningCategories().map((c) => [c.slug, c.name] as const),
);

const GROUP_TONE: Record<string, "primary" | "secondary" | "accent"> = {
  "Core Subjects": "primary",
  "Qur'an & Arabic": "secondary",
  "Activities & Play": "accent",
};

const TONE_ICON_STYLES: Record<"primary" | "secondary" | "accent", string> = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-800",
};

export default function LearnPage() {
  const featured = SAMPLE_CONTENT.filter((item) => item.featured);

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Learn" }]}
        eyebrow="Learning Hub"
        title="Learn"
        description="Every subject the platform is built around. Each one is still being filled in — visit a subject page to see its scope and check back as content is added."
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container>
          {featured.length > 0 && (
            <div>
              <Heading level="h4" as="h2" className="text-neutral-500">
                Featured
              </Heading>
              <p className="mt-1 text-sm text-neutral-500">
                A preview of the content model — these are sample records, not a
                published library yet.
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((item) => (
                  <LearningCard
                    key={item.id}
                    content={item}
                    categoryName={categoryNameBySlug.get(item.category) ?? item.category}
                    isSample
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-14 space-y-10">
            {learningCategoryGroups.map((group) => {
              const tone = GROUP_TONE[group.group] ?? "primary";
              return (
                <div key={group.group}>
                  <Heading level="h4" as="h2" className="text-neutral-500">
                    {group.group}
                  </Heading>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group.categories.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/learn/${category.slug}`}
                        className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
                      >
                        <Card interactive className="flex h-full flex-col gap-3 p-5">
                          <div
                            className={`flex size-10 items-center justify-center rounded-lg ${TONE_ICON_STYLES[tone]}`}
                          >
                            <category.icon className="size-5" aria-hidden="true" />
                          </div>
                          <Heading level="h5" as="h3" className="group-hover:text-primary-700">
                            {category.name}
                          </Heading>
                          <p className="text-sm text-neutral-600">{category.description}</p>
                          <Badge variant="neutral" className="mt-auto w-fit">
                            Ages {category.ageRange.minYears}–{category.ageRange.maxYears}
                          </Badge>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Browse all content
            </Heading>
            <p className="mt-1 text-sm text-neutral-500">
              Search and filter across every sample record above.
            </p>
            <div className="mt-4">
              <LearningContentBrowser items={SAMPLE_CONTENT} showCategoryFilter />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
