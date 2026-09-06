import * as React from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

export interface ResourceLayoutProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  description?: string;
  /** Filters/categories — stacks above the grid on mobile, sidebar on desktop. */
  filters?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * For browsing/listing pages (resource library, games index). Full-width,
 * with an optional filter rail — unlike ContentLayout, which is for reading.
 */
function ResourceLayout({ breadcrumb, title, description, filters, children }: ResourceLayoutProps) {
  return (
    <Section>
      <Container>
        <Breadcrumb items={breadcrumb} />
        <Heading level="h1" className="mt-4">
          {title}
        </Heading>
        {description && <p className="mt-3 max-w-2xl text-neutral-600">{description}</p>}

        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          {filters && <aside aria-label="Filters">{filters}</aside>}
          <div>{children}</div>
        </div>
      </Container>
    </Section>
  );
}

export { ResourceLayout };
