import { describe, expect, it } from "vitest";
import { buildFaqPageSchema } from "./faq-schema";

describe("buildFaqPageSchema", () => {
  it("returns null for an empty list — never emits schema for nothing", () => {
    expect(buildFaqPageSchema([])).toBeNull();
  });

  it("builds a FAQPage with one Question per item, in order", () => {
    const schema = buildFaqPageSchema([
      { question: "What age is this for?", answer: "Ages 3 to 6." },
      { question: "Is it free?", answer: "Yes." },
    ]);

    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What age is this for?",
          acceptedAnswer: { "@type": "Answer", text: "Ages 3 to 6." },
        },
        {
          "@type": "Question",
          name: "Is it free?",
          acceptedAnswer: { "@type": "Answer", text: "Yes." },
        },
      ],
    });
  });
});
