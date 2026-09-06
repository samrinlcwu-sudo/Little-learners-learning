import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  getAllLearningCategories,
  getLearningCategoryBySlug,
  getRelatedCategories,
} from "@/config/learning-categories";
import { LearningContentBrowser } from "@/components/patterns/learning-content-browser";
import { SAMPLE_CONTENT } from "@/lib/content/sample-content";
import { CONTENT_TYPE_LABELS } from "@/lib/content/types";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return getAllLearningCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getLearningCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `${siteConfig.url}/learn/${category.slug}` },
  };
}

export default async function LearnCategoryPage({
  params,
}: PageProps<"/learn/[category]">) {
  const { category: slug } = await params;
  const category = getLearningCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryContent = SAMPLE_CONTENT.filter((item) => item.category === category.slug);
  const relatedCategories = getRelatedCategories(category.slug);

  return (
    <Section>
      <Container>
        <div className="max-w-3xl">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Learn", href: "/learn" },
              { label: category.name },
            ]}
          />
          <div className="mt-4 flex items-center gap-3">
            <category.icon className="size-7 text-primary-600" aria-hidden="true" />
            <Heading level="h1">{category.name}</Heading>
          </div>
          <p className="mt-3 text-neutral-600">{category.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="primary">
              Ages {category.ageRange.minYears}–{category.ageRange.maxYears}
            </Badge>
            {category.contentTypes.map((type) => (
              <Badge key={type} variant="neutral">
                {CONTENT_TYPE_LABELS[type]}
              </Badge>
            ))}
          </div>

          <div className="mt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              What this covers
            </Heading>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-neutral-700">
              {category.learningObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <Heading level="h4" as="h2" className="text-neutral-500">
            Content
          </Heading>
          <div className="mt-4">
            <LearningContentBrowser items={categoryContent} />
          </div>
        </div>

        {relatedCategories.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Related categories
            </Heading>
            <ul className="mt-4 flex flex-wrap gap-3">
              {relatedCategories.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/learn/${related.slug}`}
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-300 hover:text-primary-700"
                  >
                    <related.icon className="size-4 text-primary-600" aria-hidden="true" />
                    {related.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </Section>
  );
}
