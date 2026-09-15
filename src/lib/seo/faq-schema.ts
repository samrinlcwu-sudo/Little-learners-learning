export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * The one place `FAQPage` JSON-LD gets built, so every page that shows real
 * question/answer content (src/app/faq, blog articles, learning category
 * pages, About) produces byte-for-byte the same schema shape from the same
 * items instead of hand-rolling it per page. Takes plain `{question,
 * answer}` objects rather than importing a page-specific type (e.g.
 * `BlogFaqItem`), so any real content — an FAQ array, a derived category
 * FAQ — can feed it without a type-compatibility shim.
 *
 * Returns `null` for an empty list: never emit `FAQPage` schema with zero
 * questions just because a component was rendered.
 */
export function buildFaqPageSchema(items: FaqItem[]) {
  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
