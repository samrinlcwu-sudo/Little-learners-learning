import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getAllLearningCategories,
  getLearningCategoryBySlug,
} from "@/config/learning-categories";
import { CONTENT_TYPE_LABELS } from "@/lib/content/types";

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

  return (
    <Section>
      <Container className="max-w-3xl">
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

        <EmptyState
          className="mt-10"
          title="No content published yet"
          description={`${category.name} content is still being built. Check back as lessons and resources are added.`}
        />
      </Container>
    </Section>
  );
}
