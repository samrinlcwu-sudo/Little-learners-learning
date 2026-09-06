import { Construction } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

export interface ComingSoonSectionProps {
  title: string;
  description: string;
  breadcrumb: BreadcrumbItem[];
}

/**
 * Shared shell for every nav destination that doesn't have real content yet.
 * Exists so the site can link to `/learn`, `/resources`, etc. now (avoiding
 * dead/404 nav links) without pretending any of them are finished —
 * every one of these pages says plainly that it isn't built yet.
 */
function ComingSoonSection({ title, description, breadcrumb }: ComingSoonSectionProps) {
  return (
    <Section surface="sunken" className="flex flex-1 flex-col justify-center">
      <Container className="max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <Breadcrumb items={breadcrumb} />
        </div>
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-200/70 text-neutral-500">
          <Construction className="size-7" aria-hidden="true" />
        </div>
        <Heading level="h1" className="mt-5">
          {title}
        </Heading>
        <p className="mt-3 text-neutral-600">{description}</p>
      </Container>
    </Section>
  );
}

export { ComingSoonSection };
