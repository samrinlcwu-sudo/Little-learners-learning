import { siteConfig } from "@/config/site";
import type { LearningAreaKnowledge } from "@/lib/ai/knowledge/types";

/**
 * An `ItemList` naming exactly the resources and games actually rendered
 * on this category page — same pattern and same reasoning as
 * `teacher-directory-structured-data.tsx`: renders nothing when there's
 * nothing published yet, never describes content a crawler can't also see
 * rendered on the page. Built from `LearningAreaKnowledge`
 * (src/lib/ai/knowledge/public-knowledge.ts) so the schema and the visible
 * page can never drift apart — both come from the same
 * `getCategoryJourney` call. See docs/AI_KNOWLEDGE_LAYER_ARCHITECTURE.md,
 * "SEO/AEO."
 */
function LearningAreaStructuredData({ area }: { area: LearningAreaKnowledge }) {
  const items = [...area.resources, ...area.games];
  if (items.length === 0) return null;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${area.name} resources and games`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}${item.href}`,
      name: item.title,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />;
}

export { LearningAreaStructuredData };
