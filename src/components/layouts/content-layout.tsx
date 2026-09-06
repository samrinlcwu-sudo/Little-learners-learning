import * as React from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

export interface ContentLayoutProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * For long-form, read-heavy pages (articles, resource detail pages).
 * Narrower than the default full-width public page so body text stays a
 * comfortable line length instead of stretching edge to edge.
 */
function ContentLayout({ breadcrumb, title, description, children }: ContentLayoutProps) {
  return (
    <Section>
      <Container className="max-w-3xl">
        <Breadcrumb items={breadcrumb} />
        <Heading level="h1" className="mt-4">
          {title}
        </Heading>
        {description && <p className="mt-3 text-neutral-600">{description}</p>}
        {/* Plain spacing rather than a typography plugin — revisit once real
            long-form content exists and the need is concrete. */}
        <div className="mt-8 space-y-4 text-ink [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6">
          {children}
        </div>
      </Container>
    </Section>
  );
}

export { ContentLayout };
