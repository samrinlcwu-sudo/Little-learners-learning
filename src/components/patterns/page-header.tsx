import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Section, type SectionProps } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps {
  breadcrumb: BreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Defaults to the warm cream tint — override for pages that want a different section color leading into a white content band below. */
  surface?: SectionProps["surface"];
  className?: string;
  containerClassName?: string;
}

/**
 * The shared "breadcrumb + heading + intro" band every browse/hub page
 * opens with, on a tinted background — paired with a plain white `<Section>`
 * for the content grid below it, so a listing page reads as two deliberate
 * bands instead of one long flat white surface.
 */
function PageHeader({
  breadcrumb,
  eyebrow,
  title,
  description,
  actions,
  surface = "sunken",
  className,
  containerClassName,
}: PageHeaderProps) {
  return (
    <Section
      surface={surface}
      className={cn("pb-8 pt-10 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-16", className)}
    >
      <Container className={containerClassName}>
        <Breadcrumb items={breadcrumb} />
        {eyebrow && <Eyebrow className="mt-5">{eyebrow}</Eyebrow>}
        <Heading level="h1" className={cn(eyebrow ? "mt-2" : "mt-4")}>
          {title}
        </Heading>
        {description && (
          <p className="text-lead mt-3 max-w-2xl text-neutral-600">{description}</p>
        )}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </Section>
  );
}

export { PageHeader };
