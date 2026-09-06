import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { learningCategoryGroups } from "@/config/learning-categories";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Browse Little Learners Learning's subject areas — English & literacy, math, life skills, creativity, and foundational Qur'an & Arabic learning.",
};

export default function LearnPage() {
  return (
    <Section>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Learn" }]} />
        <Heading level="h1" className="mt-4">
          Learn
        </Heading>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Every subject the platform is built around. Each one is still being
          filled in — visit a subject page to see its scope and check back as
          content is added.
        </p>

        <div className="mt-10 space-y-10">
          {learningCategoryGroups.map((group) => (
            <div key={group.group}>
              <Heading level="h4" as="h2" className="text-neutral-500">
                {group.group}
              </Heading>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/learn/${category.slug}`}
                    className="group flex flex-col gap-2 rounded-lg border border-neutral-200 bg-surface p-4 transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
                  >
                    <category.icon className="size-5 text-primary-600" aria-hidden="true" />
                    <Heading level="h5" as="h3" className="group-hover:text-primary-700">
                      {category.name}
                    </Heading>
                    <p className="text-sm text-neutral-600">{category.description}</p>
                    <Badge variant="neutral" className="mt-auto w-fit">
                      Ages {category.ageRange.minYears}–{category.ageRange.maxYears}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
