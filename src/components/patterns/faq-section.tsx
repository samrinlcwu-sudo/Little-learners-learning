import * as React from "react";
import { Heading } from "@/components/ui/heading";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { buildFaqPageSchema, type FaqItem } from "@/lib/seo/faq-schema";
import { toJsonLdHtml } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils/cn";

export interface FaqSectionProps {
  title: string;
  description?: string;
  items: FaqItem[];
  className?: string;
  /** Defaults to "h2" — override only when the surrounding page needs a different outline level for this section's heading. */
  headingAs?: React.ElementType;
}

/**
 * The one reusable FAQ block: a heading, an accessible accordion (built on
 * native <details>/<summary> — see src/components/ui/accordion.tsx), and
 * the matching `FAQPage` structured data, all generated from the same
 * `items` array. A page can never show three questions but claim five in
 * its schema, or the reverse, because there is only one array to read from.
 *
 * Renders nothing for an empty `items` list — never an empty heading or a
 * schema tag with no real content behind it.
 */
function FaqSection({ title, description, items, className, headingAs = "h2" }: FaqSectionProps) {
  if (items.length === 0) return null;

  const structuredData = buildFaqPageSchema(items);

  return (
    <div className={cn(className)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdHtml(structuredData) }} />
      <Heading level="h4" as={headingAs} className="text-neutral-500">
        {title}
      </Heading>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      <Accordion className="mt-4">
        {items.map((item) => (
          <AccordionItem key={item.question} question={item.question}>
            {item.answer}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export { FaqSection };
